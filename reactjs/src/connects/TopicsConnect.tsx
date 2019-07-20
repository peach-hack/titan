import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { fetchTopics } from '~/actions/topicAction';

import { getCollectionShort } from '../lib/urlUtil';

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      fetchTopics: fetchTopics
    },
    dispatch
  );

const mapStateToProps = (state: any, props: any) => {
  const { collection, collectionId } = props;
  const resourceId =
    collection === 'general'
      ? '/topics'
      : `/${collection}/${collectionId}/topics`;

  const postButtonPath =
    collection === 'general'
      ? '/topics/new'
      : `/${getCollectionShort(collection)}/${collectionId}/t/new`;

  return {
    topics: state.topic.items,
    loading: state.topic.loading,
    error: state.topic.error,
    resourceId,
    postButtonPath,
    ...props
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
