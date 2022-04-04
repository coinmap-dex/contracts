import { Switch, Route, useLocation } from "react-router-dom";
import { isAddress } from '@ethersproject/address';
import qs from 'qs'
import LeftColumn from "./components/LeftColumn";
import List from "./components/List";
import useLocalStorage from "./hooks/useLocalStorage";
import useInterval from "./hooks/useInterval";
import "./App.css";

function App() {
  const { search } = useLocation()
  const ref = qs.parse(search, { ignoreQueryPrefix: true }).ref
  const referrerAddress = ref && isAddress(ref.toString()) ? ref.toString() : ""
  if (referrerAddress) window.localStorage.setItem('referrer', referrerAddress)

  const [blocknumber, setBlocknumber] = useLocalStorage('blocknumber', 0)
  useInterval(() => { setBlocknumber(blocknumber + 1) }, 5000)

  return (
    <section className="section">
      <div className="container">
        <div className="columns">
          <LeftColumn />
          <Switch>
            <Route path="/">
              <List />
            </Route>
          </Switch>
        </div>
      </div>
    </section>
  );
}

export default App;
