import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/DiaryList.css';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

moment.locale('ko');
const localizer = momentLocalizer(moment);

function DiaryList() {
  const [events, setEvents] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const previewRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDiaries(user.uid);
      } else {
        setIsLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchDiaries = async (userId) => {
    const db = getFirestore();
    const diariesRef = collection(db, 'diaries');
    const q = query(
      diariesRef,
      where('userId', '==', userId),
      orderBy('entryDate', 'desc')
    );

    try {
      const querySnapshot = await getDocs(q);
      const latestDiaryPerDate = {};

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const date = moment(data.entryDate).startOf('day').format();

        if (!latestDiaryPerDate[date] || moment(data.entryDate).isAfter(latestDiaryPerDate[date].entryDate)) {
          latestDiaryPerDate[date] = {
            id: doc.id,
            title: data.content.substring(0, 20) + '...',
            start: new Date(data.entryDate),
            end: new Date(data.entryDate),
            imgSrc: data.imageUrl,
            content: data.content
          };
        }
      });

      setEvents(Object.values(latestDiaryPerDate));
      setIsLoading(false);
    } catch (error) {
      console.error("일기를 불러오는데 실패했습니다:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (previewRef.current && !previewRef.current.contains(event.target)) {
        setSelectedEvent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundImage: `url(${event.imgSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'transparent',
        height: '80px',
        border: 'none',
        borderRadius: '5px'
      },
    };
  };

  const onEventHover = (event) => {
    setHoveredEvent(event);
  };

  const onEventLeave = () => {
    setHoveredEvent(null);
  };

  const onSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="diary-list-container">
      <h2>과거 일기 보기</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        views={['month', 'week', 'day']}
        defaultView="month"
        eventPropGetter={eventPropGetter}
        onSelectEvent={onSelectEvent}
        components={{
          event: (props) => {
            const { event } = props;
            return (
              <div
                onMouseEnter={() => onEventHover(event)}
                onMouseLeave={onEventLeave}
                style={{ height: '100%', width: '100%', position: 'relative' }}
              >
                {hoveredEvent && hoveredEvent.id === event.id && (
                  <div className="event-tooltip">
                    {event.content.substring(0, 100) + '...'}
                  </div>
                )}
              </div>
            );
          }
        }}
        messages={{
          today: '오늘', // 'Today' 버튼의 텍스트를 '오늘'로 변경
          previous: '이전', // 'Back' 버튼의 텍스트를 '이전'으로 변경
          next: '다음' // 'Next' 버튼의 텍스트를 '다음'으로 변경
        }}
      />
      {selectedEvent && (
        <div className="event-preview" ref={previewRef}>
          <img src={selectedEvent.imgSrc} alt="Diary preview" onError={(e) => e.target.style.display = 'none'} />
          <p>{selectedEvent.content}</p>
        </div>
      )}
    </div>
  );
}

export default DiaryList;
