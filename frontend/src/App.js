import React, { useState } from 'react';
import './css/Input.css';
import { Configuration, OpenAIApi } from "openai";
//importing useState from react

const configuration = new Configuration({
  organization: "org-f1nNrrADJiLslpZv63AmaygR",
  apiKey: "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",
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
  
  const submitMessage = () => {
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
    <div className = "main">
      <h1>TrueTone</h1>
      <div className = "promptBox">
      <section className = "chatField">
        {chats && chats.length
        ? chats.map((chat, index) => (
          <p key = {index} className = {chat.role === "user" ? "user_msg" : ""}>
            <span>
            {chat.role === "user" ? (<b style={{color: "rgb(26, 102, 194)", fontSize: '250%', fontFamily: 'Merriweather'}}>{chat.content}</b>) : 
            (<b>{chat.content}</b>)}
            </span>
          </p>
        )) : ""}
      </section>
      <button onClick={ submitMessage }>Generate</button>
      </div>
      <div className={isTyping ? "" : "hide"}>
        <p>
          <i>{isTyping ? "Loading.." : ""}</i>
        </p>
      </div>
      <form className = "formField" action="" onSubmit = {(e) => chat(e, message)}>
        <textarea className = "inputField"
          type="text"
          name="message"
          value={message}
          placeholder="Write a response to fit the tone you're given!"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              chat(e, message);
            }
          }}
        />
      </form>
      <button onClick={ submitMessage }>Submit</button>
      <p>Top Emotions:</p>
      <p>{ (data) ? `${data[0]["name"]}: ${data[0]["score"]}` : 0 }</p>
      <p>{ (data) ? `${data[1]["name"]}: ${data[1]["score"]}` : 0 }</p>
      <p>{ (data) ? `${data[2]["name"]}: ${data[2]["score"]}` : 0 }</p>
    </div>
  );
};