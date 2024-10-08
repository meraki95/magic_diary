import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import '../styles/Chat.css';

// chatId를 생성하는 전역 함수
const createChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

function Chat({ friend, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const profileDocRef = doc(db, 'profiles', user.uid);
        const profileDocSnap = await getDoc(profileDocRef);
        if (profileDocSnap.exists()) {
          setCurrentUserProfile(profileDocSnap.data());
        }
      }
    };

    loadUserProfile();
  }, [db]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !currentUserProfile) return;

    const chatId = createChatId(user.uid, friend.id);
    console.log("Current chatId:", chatId); // 디버깅용 로그

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);

      // 메시지를 읽음으로 표시
      querySnapshot.docs.forEach(async (doc) => {
        const messageData = doc.data();
        if (messageData.to === user.uid && !messageData.read) {
          await updateDoc(doc.ref, { read: true });
        }
      });
    }, (error) => {
      console.error("실시간 메시지 로딩 오류:", error);
    });

    return () => unsubscribe();
  }, [friend.id, db, currentUserProfile]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserProfile) return;

    const user = auth.currentUser;
    if (!user) return;

    const chatId = createChatId(user.uid, friend.id);
    console.log("Sending message with chatId:", chatId); // 디버깅용 로그

    try {
      await addDoc(collection(db, 'messages'), {
        chatId,
        text: newMessage.trim(),
        createdAt: new Date(),
        senderId: user.uid,
        senderName: currentUserProfile.displayName || '익명',
        to: friend.id,
        read: false
      });
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 오류입니다.:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{friend.name}와의 채팅</h3>
        <button onClick={onClose} className="close-btn">닫기</button>
      </div>
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.senderId === auth.currentUser.uid ? 'sent' : 'received'}`}>
            <span className="message-sender">{message.senderName}</span>
            <p className="message-text">{message.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="message-input"
        />
        <button type="submit" className="send-btn">전송</button>
      </form> 
    </div>
  );
}

export default Chat;