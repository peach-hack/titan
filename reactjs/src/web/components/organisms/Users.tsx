import React, { useState, useEffect } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import {
  Radio,
  FormControl,
  RadioGroup,
  FormControlLabel
} from '@material-ui/core';

import Hidden from '@material-ui/core/Hidden';
import moment, { fromNow } from '~/lib/moment';
import Paper from '../templates/PaperWrapper';
import Progress from '../atoms/CircularProgress';
import Title from '../atoms/Title';
import UserAvatar from '../atoms/UserAvatar';

const ConditionalTableCell = (props: any) => (
  <Hidden only="xs">
    <TableCell>{props.children}</TableCell>
  </Hidden>
);

const RADIO_LATEST = '最新';
const RADIO_REGISTERD = '登録';

const Users = (props: any) => {
  const { users, error, loading, fetchUsers } = props;

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const [sortkey, setSortKey] = useState(RADIO_LATEST);

  const onSortKeyChange = (e: any) => {
    e.preventDefault();
    setSortKey(e.target.value);
  };

  const LeaderBoardHead = () => (
    <TableHead>
      <TableRow>
        <TableCell>#</TableCell>
        <TableCell />
        <TableCell>名前</TableCell>
        <ConditionalTableCell>最新</ConditionalTableCell>
        <ConditionalTableCell>登録</ConditionalTableCell>
      </TableRow>
    </TableHead>
  );

  const compare = (x: any, y: any) => {
    if (sortkey === RADIO_LATEST) {
      return moment(y.updatedAt.toDate()).diff(moment(x.updatedAt.toDate()));
    } else if (sortkey === RADIO_REGISTERD) {
      return moment(y.createdAt.toDate()).diff(moment(x.createdAt.toDate()));
    }
  };

  return (
    <Paper>
      <Title text="ユーザー一覧" />
      {error && <strong>Error: {error}</strong>}
      {loading && <Progress />}
      {users && (
        <React.Fragment>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="sortkey"
              name="sortkey"
              value={sortkey}
              onChange={onSortKeyChange}
            >
              <div style={{ display: 'flex' }}>
                <FormControlLabel
                  value={RADIO_LATEST}
                  control={<Radio color="primary" />}
                  label={RADIO_LATEST}
                />
                <FormControlLabel
                  value={RADIO_REGISTERD}
                  control={<Radio color="primary" />}
                  label={RADIO_REGISTERD}
                />
              </div>
            </RadioGroup>
          </FormControl>
          <Table>
            <LeaderBoardHead />
            <TableBody>
              {users.sort(compare).map((user: any, index: number) => (
                <TableRow key={user.id} hover>
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <UserAvatar
                      photoURL={user.photoURL}
                      userId={user.shortId}
                    />
                  </TableCell>
                  <TableCell>{user.displayName || 'Annonymous'}</TableCell>
                  <ConditionalTableCell>
                    {fromNow(user.updatedAt.toDate())}
                  </ConditionalTableCell>
                  <ConditionalTableCell>
                    {fromNow(user.createdAt.toDate())}
                  </ConditionalTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </React.Fragment>
      )}
    </Paper>
  );
};

export default Users;
