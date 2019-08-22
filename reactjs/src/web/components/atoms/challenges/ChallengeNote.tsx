import React, { useState } from 'react';
import { TimelineItem } from 'vertical-timeline-component-for-react';
import { Link } from 'react-router-dom';
import { TextField } from '@material-ui/core';
import shortId from 'shortid';
import {
  secondaryColor,
  brandWhite,
  brandSuccess,
  brandWarning,
  primaryColor,
  brandPink
} from '~/lib/theme';
import { formatDatetimeShort } from '~/lib/moment';
import {
  NOTE_TYPE_JOIN,
  NOTE_TYPE_OPEN,
  NOTE_TYPE_CLOSE,
  NOTE_TYPE_RECORD,
  NOTE_TYPE_RESET,
  NOTE_TYPE_TOPIC,
  NOTE_TYPE_DEFAULT
} from '~/constants/note';

import { update } from '~/lib/firebase';
import TextFieldView from '../TextFieldView';

const ChallengeNoteJoin = (props: any) => {
  const { startedAt } = props.data;
  return (
    <TimelineItem
      key={NOTE_TYPE_JOIN}
      dateText={`${formatDatetimeShort(startedAt)} - Joined`}
      dateInnerStyle={{ background: secondaryColor, color: brandWhite }}
    >
      <p>チャレンジ大会に参加しました。</p>
    </TimelineItem>
  );
};

const ChallengeNoteOpen = (props: any) => {
  const openedAt: Date = props.data.openedAt;
  return (
    <TimelineItem
      key={NOTE_TYPE_OPEN}
      dateText={formatDatetimeShort(openedAt) + ' - Opened'}
      dateInnerStyle={{ background: secondaryColor, color: brandWhite }}
    >
      <p>チャレンジ大会がスタートしました。</p>
    </TimelineItem>
  );
};

const ChallengeNoteClose = (props: any) => {
  const closedAt: Date = props.data.closedAt;

  return (
    <TimelineItem
      key={NOTE_TYPE_CLOSE}
      dateText={formatDatetimeShort(closedAt) + '- Closed'}
      dateInnerStyle={{ background: secondaryColor, color: brandWhite }}
    >
      <p>チャレンジ大会が終了しました。</p>
    </TimelineItem>
  );
};

const ChallengeNoteRecord = (props: any) => {
  const { data } = props;
  const { timestamp, days } = data;

  const daysString = days === 0 || days === 1 ? `${days}day` : `${days}days`;

  return (
    <TimelineItem
      key={NOTE_TYPE_RECORD}
      dateText={formatDatetimeShort(timestamp) + '- Record'}
      dateInnerStyle={{ background: brandSuccess, color: brandWhite }}
    >
      <p>記録を投稿しました。({daysString})</p>
    </TimelineItem>
  );
};

const ChallengeNoteReset = (props: any) => {
  const { data } = props;
  const { timestamp } = data;

  return (
    <TimelineItem
      key={NOTE_TYPE_RESET}
      dateText={formatDatetimeShort(timestamp) + '- Reset'}
      dateInnerStyle={{ background: brandWarning, color: brandWhite }}
    >
      <p>リセットしました。</p>
    </TimelineItem>
  );
};

const ChallengeNoteTopic = (props: any) => {
  const { data } = props;
  const { timestamp, path, title } = data;

  return (
    <TimelineItem
      key={NOTE_TYPE_TOPIC}
      dateText={formatDatetimeShort(timestamp) + '- Topic'}
      dateInnerStyle={{ background: primaryColor, color: brandWhite }}
    >
      <p>トピックを投稿しました。</p>
      <Link to={path}>{title}</Link>
    </TimelineItem>
  );
};

const ChallengeNoteDefault = (props: any) => {
  const { data } = props;
  const { timestamp, text, noteId, challengeId } = data;

  const [edit, setEdit] = useState(false);
  const [buffer, setBuffer] = useState(text);

  const onBufferChange = (e: any) => {
    e.preventDefault();
    setBuffer(e.target.value);
  };

  const onSave = () => {
    const resourceId = `/challenges/${challengeId}/notes/${noteId}`;
    const data = {
      text: buffer,
      updatedAt: new Date()
    };
    update(resourceId, data).then(() => setEdit(false));
  };

  const renderText = () => (
    <React.Fragment>
      <TextFieldView text={buffer} />
      <p>
        <span
          style={{ textDecorationLine: 'underline' }}
          role="button"
          onClick={() => setEdit(true)}
        >
          編集
        </span>{' '}
        <span style={{ textDecorationLine: 'underline' }}>削除</span>
      </p>
    </React.Fragment>
  );

  const renderEdit = () => (
    <React.Fragment>
      <TextField
        value={buffer}
        variant="outlined"
        margin="normal"
        required
        id="note"
        label="ノート"
        fullWidth
        multiline
        onChange={onBufferChange}
      />
      <p>
        <span
          style={{ textDecorationLine: 'underline' }}
          role="button"
          onClick={onSave}
        >
          保存
        </span>{' '}
      </p>
    </React.Fragment>
  );

  return (
    <TimelineItem
      key={NOTE_TYPE_DEFAULT}
      dateText={formatDatetimeShort(timestamp) + '- Note'}
      dateInnerStyle={{ background: brandPink, color: brandWhite }}
    >
      {edit ? renderEdit() : renderText()}
    </TimelineItem>
  );
};

const componentMap = new Map([
  [NOTE_TYPE_JOIN, (data: any) => <ChallengeNoteJoin data={data} />],
  [NOTE_TYPE_OPEN, (data: any) => <ChallengeNoteOpen data={data} />],
  [NOTE_TYPE_CLOSE, (data: any) => <ChallengeNoteClose data={data} />],
  [NOTE_TYPE_RECORD, (data: any) => <ChallengeNoteRecord data={data} />],
  [NOTE_TYPE_RESET, (data: any) => <ChallengeNoteReset data={data} />],
  [NOTE_TYPE_TOPIC, (data: any) => <ChallengeNoteTopic data={data} />],
  [NOTE_TYPE_DEFAULT, (data: any) => <ChallengeNoteDefault data={data} />]
]);

const ChallengeNote = (props: any) => {
  const { type, data } = props;

  const noteFactory = componentMap.get(type);

  return noteFactory!(data);
};

export default ChallengeNote;
