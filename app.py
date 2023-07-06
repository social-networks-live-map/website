import os
from flask import Flask, render_template, jsonify

app = Flask(__name__, static_url_path='/camsmap/static')

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/snlivemap')
def render_website():
    # Get the list of JSON file names in the folder
    data_folder = 'static/data/mastodon'
    message_files = [filename.split(".")[0] for filename in os.listdir(data_folder) if filename.endswith(".json")]

    # Pass the JSON to the front end
    return render_template("index.html", messageIds=message_files)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=1024, debug=True)
