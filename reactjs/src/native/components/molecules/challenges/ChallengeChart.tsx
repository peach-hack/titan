import * as React from 'react';

import moment from 'moment';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Math.round(Dimensions.get('window').width);

const ChallengeChart = (props: any) => {
  const { histories } = props;

  const config = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  const formatDate = (date: string): string => {
    return moment(date).format('MM/DD');
  };

  const sorted = histories.sort(
    (x: any, y: any) => x.timestamp.seconds - y.timestamp.seconds
  );

  const labels = sorted.map((history: any) =>
    formatDate(history.timestamp.toDate().toISOString())
  );

  const scoreList = sorted.map((history: any) => history.score);
  const daysList = sorted.map((history: any) => history.days);
  const accDaysList = sorted.map((history: any) => history.accDays);

  const data = {
    labels,
    datasets: [
      {
        data: scoreList,
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`
      },
      {
        data: daysList,
        color: (opacity = 1) => `rgba(0, 145, 255, ${opacity})`
      },
      {
        data: accDaysList,
        color: (opacity = 1) => `rgba(0, 145, 255, ${opacity})`
      }
    ]
  };

  return (
    <LineChart
      data={data}
      width={screenWidth - 20}
      height={220}
      withShadow={false}
      chartConfig={config}
    />
  );
};

export default ChallengeChart;
