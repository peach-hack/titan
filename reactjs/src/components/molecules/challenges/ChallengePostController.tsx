import React, { useEffect } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { connect } from 'react-redux';
import { useDocument } from 'react-firebase-hooks/firestore';
import firebase from '../../../lib/firebase';

import RecordButton from '../../atoms/challenges/ChallengeRecordButton';
import Progress from '../../atoms/CircularProgress';

import { postMessage } from '../../../lib/discord.client.api';

import rollbar from '../../../lib/rollbar';
import { getUserDashboardURL } from '../../../lib/urlUtil';
import { getParticipantsUserId } from '../../../lib/resourceUtil';

const StyledCenterContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StyledTimerButtonContainer = styled.div`
  margin: 10px;
  display: flex;
  justify-content: space-around;
`;

const ChallengePostController = (props: any) => {
  const { userShortId, userName, closeHandler } = props;
  const { webhookURL, openedAt, closedAt, id } = props.challenge;

  const challengeId = id;
  const resourceId = getParticipantsUserId(challengeId, userShortId);

  const [value, loading, error] = useDocument(
    firebase.firestore().doc(resourceId)
  );

  const now = new Date();
  const isDaysValid = (days: number) => {
    return days !== undefined && days !== null;
  };

  const writeRecord = (props: any) => {
    const { days, score, accDays, maxDays, histories } = props;

    if (
      histories.length > 0 &&
      histories.filter(
        (history: any) =>
          history.type === 'RECORD' &&
          moment(history.timestamp.toDate()).isSame(moment(now), 'days')
      ).length !== 0
    ) {
      window.alert('記録の投稿は1日1回までです。'); // eslint-disable-line
      return;
    }

    const tomorrow = !isDaysValid(days) ? 1 : days + 1;
    const newScore = score + 1;
    const newAccDays = !isDaysValid(accDays) ? 1 : accDays + 1;
    const newMaxDays = tomorrow > maxDays ? tomorrow : maxDays;

    const newHistory = {
      id: histories.length + 1,
      timestamp: new Date(),
      score: newScore,
      days: tomorrow,
      diff: moment().diff(moment(openedAt.toDate()), 'days'),
      type: 'RECORD'
    };

    const updateData: any = {
      days: tomorrow,
      score: newScore,
      accDays: newAccDays,
      maxDays: newMaxDays,
      startedAt: now,
      updatedAt: now,
      histories: firebase.firestore.FieldValue.arrayUnion(newHistory)
    };

    if (!isDaysValid(days)) updateData.startedAt = now;

    firebase
      .firestore()
      .doc(resourceId)
      .update(updateData)
      .then(() => {
        const url = getUserDashboardURL(challengeId, userShortId);
        const message = `${userName}さんが計${newAccDays}日達成しました！`;
        postMessage(webhookURL, message);
      })
      .then(() => {
        window.alert('投稿が完了しました。');  // eslint-disable-line 
      })
      .then(() => closeHandler())
      .then(
        () => (window.location.href = getUserDashboardURL(challengeId, userShortId)) // eslint-disable-line
      )
      .catch(error => rollbar.error(error));
  };

  const resetRecord = (props: any) => {
    const { score, histories } = props;

    const newScore = score - 3;

    const newHistory = {
      id: histories.length + 1,
      timestamp: new Date(),
      score: newScore,
      days: 0,
      diff: moment().diff(moment(openedAt), 'days'),
      type: 'RESET'
    };

    const resetData = {
      startedAt: null,
      updatedAt: now,
      days: 0,
      score: newScore,
      histories: firebase.firestore.FieldValue.arrayUnion(newHistory)
    };

    firebase
      .firestore()
      .doc(resourceId)
      .update(resetData)
      .then(() => {
        const message = `${userName}さんがリセットしました`;
        postMessage(webhookURL, message);
      })
      .then(() => closeHandler())
      .then(
        () => (window.location.href = getUserDashboardURL(challengeId, userShortId)) // eslint-disable-line
      )
      .catch(error => rollbar.error(error));
  };

  const confirm = (props: any) => {
    const { days } = props;
    if (!isDaysValid(days)) return;

    if (window.confirm('本当にリセットしますか？')) { // eslint-disable-line
      resetRecord(props);
    }
  };

  const data = value && value.data();
  const hide = !(
    moment(now).diff(moment(openedAt.toDate())) >= 0 &&
    moment(now).diff(moment(closedAt.toDate())) < 0
  );

  useEffect(() => {
    if (
      data !== undefined &&
      data.updatedAt !== undefined &&
      data.updatedAt !== null &&
      moment(now).diff(
        moment(new Date(data.updatedAt.toDate().setHours(0, 0, 0, 0))),
        'days'
      ) > 1 &&
      moment(now).diff(moment(openedAt.toDate()), 'days') !== 0 &&
      moment(now).diff(moment(closedAt.toDate()), 'days') <= 0
    ) {
      const newScore = data.score - 3;

      const newHistory = {
        id: data.histories.length + 1,
        timestamp: new Date(),
        score: newScore,
        days: 0,
        diff: moment().diff(moment(openedAt.toDate()), 'days'),
        type: 'RESET'
      };

      const resetData = {
        startedAt: null,
        updatedAt: now,
        days: 0,
        score: newScore,
        histories: firebase.firestore.FieldValue.arrayUnion(newHistory)
      };

      firebase
        .firestore()
        .doc(resourceId)
        .update(resetData)
        .then(() => window.alert('1日以上記録がなかったため、記録をリセットしました'));　// eslint-disable-line
    }
  }, [closedAt, data, now, openedAt, resourceId]);

  return (
    <StyledCenterContainer>
      {error && <strong>Error: {error}</strong>}
      {loading && <Progress />}
      {hide ? (
        <h3>チャレンジ開始までお待ちください</h3>
      ) : (
        data && (
          <React.Fragment>
            <StyledTimerButtonContainer>
              <RecordButton
                text="記録する"
                color="primary"
                handleClick={() => writeRecord(data)}
              />
              <RecordButton
                text="リセット"
                color="inherit"
                handleClick={() => confirm(data)}
              />
            </StyledTimerButtonContainer>
          </React.Fragment>
        )
      )}
    </StyledCenterContainer>
  );
};

const mapStateToProps = (state: any, props: any) => ({
  userShortId: state.firebase.profile.shortId,
  userName: state.firebase.profile.displayName,
  ...props
});

export default connect(mapStateToProps)(ChallengePostController);
