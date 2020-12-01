import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Dashboard from '../screens/Dashboard';
const AppRouter = createStackNavigator({
  Dashboard: {
    screen: Dashboard
  }
});
export default createAppContainer(AppRouter);