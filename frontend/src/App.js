import React, { useState } from 'react';
import './css/Input.css';
import { Configuration, OpenAIApi } from "openai";
import logo from './css/assets/load.gif';
//importing useState from react

const configuration = new Configuration({
  organization: "org-f1nNrrADJiLslpZv63AmaygR",
  apiKey: "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"
});

const openai = new OpenAIApi(configuration);


export default function App() {

  //holds information sent from app to AI
  const [message, setMessage] = useState("");
  //contains ALL MESSAGES
  const [chats, setChats] = useState([]);
  //whether AI is typing
  const [isTyping, setIsTyping] = useState(false);
  // emotion data
  const [data, setData] = useState();

  const emotions = ["Admiration","Adoration","Aesthetic Appreciation","Amusement","Anger","Anxiety","Awe","Awkwardness","Boredom","Calmness","Concentration","Confusion","Contemplation","Contempt","Contentment","Craving","Desire","Determination","Disappointment","Disgust","Distress","Doubt","Ecstasy","Embarrassment","Empathic Pain","Entrancement","Envy","Excitement","Fear","Guilt","Horror","Interest","Joy","Love","Nostalgia","Pain","Pride","Realization","Relief","Romance","Sadness","Satisfaction","Shame","Surprise (negative)","Surprise (positive)","Sympathy","Tiredness","Triumph"];

  const chat = async(e, message) => {
    e.preventDefault();
    
    if (!message) return;
    setIsTyping(true)
    
    let msgs = chats;

    const getRandomValue = () => {
      const randomIndex = Math.floor(Math.random() * emotions.length);
      return emotions[randomIndex];
    };
    
    message = getRandomValue();
    msgs.push({role: "user", content: message});
    const newChat = [{ role: "user", content: message }]; // Create a new array with the new message
    setChats(newChat);
    //setChats(msgs);
    setMessage("");

    await openai
      .createChatCompletion({
        model: "gpt-4-0613",
        messages: [
          {
          role: "system",
          content: "Give me a 1 sentence prompt that encourages me to elicit the emotion i provide",
          },
          ...chats,
        ],
      })
      .then((res) => {
        msgs.push(res.data.choices[0].message);
        //const newChat = [msgs];
        setChats([...newChat, res.data.choices[0].message]);
        setIsTyping(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  
  const submitMessage = (e) => {
    e.preventDefault();
    chat(e, " ");
    fetch('http://localhost:5000/api/data', {
      method: 'POST',
      headers: {
          'Content-Type': 'text/plain',
      },
      body: message,
    }).then(output => output.json()).then(data => setData(data))
  }

  const submitMessage1 = (e) => {
    e.preventDefault();
    //chat(e, " ");
    fetch('http://localhost:5000/api/data', {
      method: 'POST',
      headers: {
          'Content-Type': 'text/plain',
      },
      body: message,
    }).then(output => output.json()).then(data => setData(data))
  }

  return (
    //if print is true, print data. else null
    // each time input is changed, call getData()
    // on click, set print to true.
    
    <div className = "mainMain">
      <h1 style={{ top: "10%"}}>TrueTone</h1>
      <div className = "main">
        
        <section className = "aiSide">
          <section className = "chatField">
            {chats && chats.length
            ? chats.map((chat, index) => (
              <p key = {index} className = {chat.role === "user" ? "user_msg" : ""}>
                <span>
                {chat.role === "user" && !isTyping ? (<b style={{color: "rgb(127, 172, 227);", fontSize: '270%', fontFamily: 'Merriweather'}}>{chat.content}</b>) : 
                (
                  isTyping ? <img src={logo} width="50%"/> : (chat.role !== "user" && <b>{chat.content}</b>)
                )}
                </span>
              </p>
            ))
            : ""}
          </section>
          <button className = "generateButton" onClick={submitMessage}>Generate</button>
        </section>
        <div className = "humanSide">
          <form className = "formField" action="" onSubmit = {(e) => chat(e, message)}>
            <textarea className = "inputField"
              type="text"
              name="message"
              value={message}
              placeholder="Write a response to fit the tone you're given!"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
              }}
            />
          </form>
          <button className = "submitButton" onClick={ submitMessage1 }>Submit</button>
        </div>
      </div>
      <div className = "results1">
          <p className="results">{ (data) ? `${data[0]["name"]}: ${data[0]["score"]}` : `` }</p>
          <p className="results">{ (data) ? `${data[1]["name"]}: ${data[1]["score"]}` : `` }</p>
          <p className="results">{ (data) ? `${data[2]["name"]}: ${data[2]["score"]}` : `` }</p>
        </div>
    </div>
  );
};