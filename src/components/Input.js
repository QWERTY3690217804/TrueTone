import React, { useState } from 'react';
import './Input.css';
import Info from './Info.js';
import { Configuration, OpenAIApi } from "openai";
//importing useState from react

const configuration = new Configuration({
  organization: "org-f1nNrrADJiLslpZv63AmaygR",
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);


const Input = () => {

  //holds information sent from app to AI
  const [message, setMessage] = useState("");
  //contains ALL MESSAGES
  const [chats, setChats] = useState([]);
  //whether AI is typing
  const [isTyping, setIsTyping] = useState(false);

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
          content: "Give me a 1-2 sentence casual roleplay prompt that encourages me to elicit the emotion i provide",
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

  return (
    //if print is true, print data. else null
    // each time input is changed, call getData()
    // on click, set print to true.
    <main>

      <section className = "frame">
        <section className = "chatField">
          {chats && chats.length
          ? chats.map((chat, index) => (
            <p key = {index} className = {chat.role === "user" ? "user_msg" : ""}>
              <span>
              {chat.role === "user" ? (<b style={{color: "rgb(26, 102, 194)", fontSize: '250%', fontFamily: 'Merriweather'}}>{chat.content}</b>) : 
              (<b>{chat.content}</b>)}
              </span>
            </p>
          ))
          : ""}
        </section>

        <div className={isTyping ? "" : "hide"}>
          <p>
            <i>{isTyping ? "Loading.." : ""}</i>
          </p>
        </div>

        <form className = "formField" action="" onSubmit = {(e) => chat(e, message)}>
          <h1>Write your response</h1>
          <p>Try to gear your answer towards the emotion titled!</p>
          <textarea className = "inputField"
            type="text"
            name="message"
            value={message}
            placeholder="Type a story to generate given prompts"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                chat(e, message);
              }
            }}
          />
        </form>
      </section>
    </main>
  );
};

export default Input;