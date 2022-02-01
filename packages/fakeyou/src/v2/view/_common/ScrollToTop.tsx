import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { History } from "history";

// A solution for scroll-to-top behavior.
// From https://stackoverflow.com/a/54343182
// And also https://v5.reactrouter.com/web/guides/scroll-restoration

interface Props {
  history : History,
}

function ScrollToTop(props: Props) {
  let { history } = props;
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unlisten();
    }
  }, [history]);

  return (null);
}

export default withRouter(ScrollToTop);