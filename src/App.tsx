import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
