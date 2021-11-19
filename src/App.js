import React, { useState, useRef } from 'react';
import './App.css';
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAGrdzagGZWZDlRzLAAqD3-oYdZu7b3Zho",
  authDomain: "basic-chat-a231f.firebaseapp.com",
  projectId: "basic-chat-a231f",
  storageBucket: "basic-chat-a231f.appspot.com",
  messagingSenderId: "196538475150",
  appId: "1:196538475150:web:92e1d75f8e240e24129fdf"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
  <div className='App'>
    <header>
      <h1>Basic-Chat</h1>
      <SignOut />
    </header>

    <section>
    {user ? <ChatRoom /> : <SignIn />}
    </section>
  </div>
  );
}

const SignIn = () => {
  const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
  }
  return (
    <>
      <button className='sign-in' onClick = {signInWithGoogle}>Sign in with Google</button>
      <p>Do NOT violate community guidelines or you will be BANNED from the chat!</p>
    </>
  )
}

const SignOut = () => {

  return auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>Sign out</button>
  )
}

const ChatRoom = () => {
  const scroll = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState();

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text:formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    scroll.current.scrollIntoView({ behavior: 'smooth' });

  }
  return (
      <>
          <main>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

          <div ref={scroll}>

          </div>

          </main>

          <form onSubmit={sendMessage}>
            <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

            <button type='submit'> Send </button>
          </form>
      </>
  )
}

const ChatMessage = (props) => {
  const {text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'revieved';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )}

export default App;
