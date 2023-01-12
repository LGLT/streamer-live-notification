/*global chrome*/

import { useState, useEffect } from 'react';
import "./App.css"


export default function App() {

  const [streamersState, setStreamersState] = useState([]);
  const [actualStreamerPage, setActualStreamerPage] = useState()

  useEffect(() => {
    chrome.storage.local.get(["streamers"]).then((result) => {
      if(result.streamers) setStreamersState(result.streamers);
      else setStreamersState([]);
    });
  }, [])

  useEffect(() => {
    chrome.storage.local.get(["actualStreamerPage"]).then((result) => {
      if(result.actualStreamerPage) setActualStreamerPage(result.actualStreamerPage);
      else setActualStreamerPage('');
    });
  }, [actualStreamerPage])
  

  const addStreamer = (streamerName) => {
    chrome.storage.local.get(["streamers"]).then((result) => {
      const streamers = result.streamers || [];
      streamers.push({ name: streamerName, state: 'offline'});
      chrome.storage.local.set({streamers: streamers})
    }).then(() => setStreamersState([...streamersState, { name: streamerName, state: 'offline'}]))
  }

  const deleteStreamer = (streamerName) => {
    chrome.storage.local.get(["streamers"]).then((result) => {
      const streamers = result.streamers || [];
      const streamerIndex = streamers.indexOf( (s) => s.name === streamerName); 
      streamers.splice(streamerIndex, 1)
      chrome.storage.local.set({streamers: streamers})
      setStreamersState(streamers)
    })
  }

  const compareActualWithStreamersEnabled = () => {
    if(actualStreamerPage && actualStreamerPage.includes('twitch.tv')){
      const streamerParam = actualStreamerPage.split("https://www.twitch.tv/")[1];
      const isInList = streamersState.find( s => s.name === streamerParam )
      if(!isInList) return false
    }
    return true
  }

  return (
    <div className="main">
      <h3 className='text-center '>My streamers list</h3>
      <div className='div-add-actual-streamer'>
        { (compareActualWithStreamersEnabled()) ? null
          :
          <button className='btn btn-outline-secondary btn-sm small-font' 
            onClick={() => addStreamer(actualStreamerPage.split("https://www.twitch.tv/")[1])}
          >
            Add {actualStreamerPage.split("https://www.twitch.tv/")[1]} to the list
          </button>
        }
      </div>
      <div>
        <ul>
          { streamersState ?
            streamersState.map((streamer, index) => (
              <div key={index} className='streamer-div'>
                <li className='streamerName-li'>{streamer.name}</li>
                <li className='streamerState-li' style={ streamer.state === 'online' ? {color: 'green'} : {color: 'red'}}>{streamer.state}</li>
                <button className='btn btn-danger btn-sm small-font' onClick={() => deleteStreamer(streamer.name)}>Delete</button>
              </div>
            ))
            : null
          }
        </ul>
        <form className='form'>
          <input className='form-control input-sm small-font' style={{ padding: '0' }} type="text" placeholder="Streamer name" id="streamerName" />
          <button className='btn btn-primary btn-sm small-font' onClick={() => addStreamer(document.getElementById('streamerName').value)}>Add</button>
        </form>
      </div>
    </div>
  );
}

