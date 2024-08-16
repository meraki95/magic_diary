import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko'; // 한국어 로케s일 가져오기
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/DiaryList.css';

// 한국어 로케일 적용
moment.locale('ko');
const localizer = momentLocalizer(moment);

function DiaryList() {
  const [events] = useState([
    {
      title: '사용자 업로드 사진',
      start: new Date(2024, 7, 1),
      end: new Date(2024, 7, 1),
      imgSrc: 'img-url-1.png',
    },
    {
      title: '사용자 업로드 사진',
      start: new Date(2024, 7, 2),
      end: new Date(2024, 7, 2),
      imgSrc: 'img-url-2.png',
    },
    // 더 많은 일정 데이터
  ]);

  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundImage: `url(${event.imgSrc})`,
        backgroundSize: 'cover',
        color: 'white',
        height: '80px', // 높이를 조정하여 사진이 잘 보이게
      },
    };
  };

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
      />
    </div>
  );
}

export default DiaryList;
