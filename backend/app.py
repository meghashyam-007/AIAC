import os, sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import requests

load_dotenv()
app = Flask(__name__)
CORS(app)
DB_PATH = os.path.join(os.path.dirname(__file__), 'agriculture.db')

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with db() as c:
        c.executescript('''
        CREATE TABLE IF NOT EXISTS crops(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,field TEXT NOT NULL,stage TEXT NOT NULL,health INTEGER NOT NULL DEFAULT 80);
        CREATE TABLE IF NOT EXISTS irrigation(id INTEGER PRIMARY KEY AUTOINCREMENT,field TEXT NOT NULL,date TEXT NOT NULL,time TEXT NOT NULL,duration INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'Scheduled');
        ''')
        if c.execute('SELECT COUNT(*) FROM crops').fetchone()[0] == 0:
            c.executemany('INSERT INTO crops(name,field,stage,health) VALUES(?,?,?,?)', [('Rice','Field A','Vegetative',91),('Tomato','Field B','Flowering',84),('Cotton','Field C','Growth',88)])
        if c.execute('SELECT COUNT(*) FROM irrigation').fetchone()[0] == 0:
            today = datetime.now().strftime('%Y-%m-%d')
            c.executemany('INSERT INTO irrigation(field,date,time,duration,status) VALUES(?,?,?,?,?)', [('Field A · Rice',today,'06:00',25,'Scheduled'),('Field B · Tomato',today,'17:30',15,'Recommended')])

def rows(sql, args=()):
    with db() as c: return [dict(r) for r in c.execute(sql,args).fetchall()]

def demo_weather(city):
    return {'city':city,'temperature_c':29,'humidity_percent':62,'rain_chance_percent':25,'condition':'Partly cloudy','source':'Demo weather data — configure WEATHER_API_KEY for live conditions'}

@app.get('/api/health')
def health(): return jsonify({'status':'ok','service':'Smart Agriculture API','database':'SQLite'})

@app.get('/api/dashboard')
def dashboard():
    crops = rows('SELECT * FROM crops ORDER BY id')
    irrigation = rows('SELECT * FROM irrigation ORDER BY date,time')
    soil = {'moisture_percent':42,'temperature_c':26,'ph':6.7,'source':'Simulated readings — no physical sensor connected'}
    recommendations = [
      {'type':'Water','title':'Check moisture in Field B','detail':'Moisture is moderate. Recheck soil before evening irrigation.','priority':'Medium'},
      {'type':'Weather','title':'Plan around possible rain','detail':'Review the forecast before running the next irrigation cycle.','priority':'Low'},
      {'type':'Crop health','title':'Inspect tomato leaves','detail':'Carry out a visual check for spots or discoloration.','priority':'Medium'}]
    return jsonify({'farm':{'name':'Green Valley Farm','location':'India','area_acres':12.5},'crops':crops,'soil':soil,'irrigation':irrigation,'recommendations':recommendations,'updated_at':datetime.now().isoformat(timespec='minutes')})

@app.get('/api/crops')
def get_crops(): return jsonify(rows('SELECT * FROM crops ORDER BY id'))

@app.post('/api/crops')
def add_crop():
    d=request.get_json(silent=True) or {}
    name=str(d.get('name','')).strip(); field=str(d.get('field','')).strip(); stage=str(d.get('stage','')).strip()
    try: health=int(d.get('health',80))
    except (TypeError,ValueError): return jsonify({'error':'Health must be a number'}),400
    if not name or not field or not stage: return jsonify({'error':'Name, field and growth stage are required'}),400
    if not 0 <= health <= 100: return jsonify({'error':'Health must be between 0 and 100'}),400
    with db() as c: cur=c.execute('INSERT INTO crops(name,field,stage,health) VALUES(?,?,?,?)',(name,field,stage,health)); crop_id=cur.lastrowid
    return jsonify(next(x for x in rows('SELECT * FROM crops') if x['id']==crop_id)),201

@app.delete('/api/crops/<int:crop_id>')
def delete_crop(crop_id):
    with db() as c: cur=c.execute('DELETE FROM crops WHERE id=?',(crop_id,))
    if not cur.rowcount: return jsonify({'error':'Crop not found'}),404
    return jsonify({'message':'Crop deleted'})

@app.get('/api/irrigation')
def get_irrigation(): return jsonify(rows('SELECT * FROM irrigation ORDER BY date,time'))

@app.post('/api/irrigation')
def add_irrigation():
    d=request.get_json(silent=True) or {}
    field=str(d.get('field','')).strip(); date=str(d.get('date','')).strip(); time=str(d.get('time','')).strip()
    try: duration=int(d.get('duration',0))
    except (TypeError,ValueError): return jsonify({'error':'Duration must be a number'}),400
    if not field or not date or not time or duration < 1 or duration > 600: return jsonify({'error':'Enter field, date, time and a duration between 1 and 600 minutes'}),400
    with db() as c: cur=c.execute('INSERT INTO irrigation(field,date,time,duration,status) VALUES(?,?,?,?,?)',(field,date,time,duration,'Scheduled')); item_id=cur.lastrowid
    return jsonify(next(x for x in rows('SELECT * FROM irrigation') if x['id']==item_id)),201

@app.delete('/api/irrigation/<int:item_id>')
def delete_irrigation(item_id):
    with db() as c: cur=c.execute('DELETE FROM irrigation WHERE id=?',(item_id,))
    if not cur.rowcount: return jsonify({'error':'Schedule not found'}),404
    return jsonify({'message':'Schedule deleted'})

@app.get('/api/analytics')
def analytics():
    crops=rows('SELECT * FROM crops')
    schedules=rows('SELECT * FROM irrigation')
    return jsonify({'crop_count':len(crops),'average_health':round(sum(x['health'] for x in crops)/len(crops)) if crops else 0,'schedule_count':len(schedules),'scheduled_minutes':sum(x['duration'] for x in schedules)})

@app.get('/api/weather')
def weather():
    city=request.args.get('city',os.getenv('WEATHER_CITY','Hyderabad'))
    key=os.getenv('WEATHER_API_KEY')
    if not key: return jsonify(demo_weather(city))
    try:
        r=requests.get('https://api.openweathermap.org/data/2.5/weather',params={'q':city,'appid':key,'units':'metric'},timeout=8); r.raise_for_status(); x=r.json()
        return jsonify({'city':x.get('name',city),'temperature_c':round(x['main']['temp']),'humidity_percent':x['main']['humidity'],'rain_chance_percent':None,'condition':x['weather'][0]['description'].title(),'source':'Live current conditions from OpenWeatherMap'})
    except (requests.RequestException,KeyError,ValueError): return jsonify(demo_weather(city))

init_db()
if __name__ == '__main__': app.run(debug=True,port=5000)
