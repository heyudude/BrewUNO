import React, { Component } from 'react';
import SectionContent from '../components/SectionContent';
import MashSettings from './MashSettings';
import BoilSettings from './BoilSettings';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { withNotifier } from '../components/SnackbarNotification';
import { GET_ACTIVE_STATUS, START_BREW, NEXT_STEP_BREW, STOP_BREW, ExecuteRestCall } from '../constants/Endpoints';

import ResponsiveContainer from 'recharts/lib/component/ResponsiveContainer';
import LineChart from 'recharts/lib/chart/LineChart';
import Line from 'recharts/lib/cartesian/Line';
import XAxis from 'recharts/lib/cartesian/XAxis';
import YAxis from 'recharts/lib/cartesian/YAxis';
import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid';
import Tooltip from 'recharts/lib/component/Tooltip';
import Legend from 'recharts/lib/component/Legend';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

let interval;

class Brew extends Component {

  constructor(props) {
    super(props)
    this.getStatus();
    this.state = {
      status: {},
      data: [],
      fetched: false
    }

    interval = setInterval(() => {
      this.getStatus();
    }, 15000);
  }


  updateStatus() {
    if (this.state.status.active_step > 0) {
      if (!this.state.fetched) {
        var json = eval("[" + this.state.status.temperatures + "]")
        var firstValues = [];
        json.forEach(element => {
          firstValues.push({ name: '', Target: element.t, Current: element.c })
        });
        this.setState({
          data: firstValues,
          fetched: true
        })
      }
      else {
        this.setState({
          data: [...this.state.data, { name: '', Target: this.state.status.target_temperature, Current: this.state.status.temperature }]
        })
      }
    }
  }

  getStatus() {
    ExecuteRestCall(GET_ACTIVE_STATUS, 'GET', (json) => { this.setState({ status: json }, this.updateStatus) }, null, this.props)
  }

  componentWillUnmount() {
    clearInterval(interval);
  }

  render() {
    const { classes } = this.props;
    return (
      <SectionContent title="Brew">
        <Button variant="contained" color="primary" className={classes.button}
          disabled={this.state.status.active_step != 0}
          onClick={() => { ExecuteRestCall(START_BREW, 'POST', (json) => { this.setState({ status: json }) }, this.props) }}
        >
          Start
      </Button>
        <Button variant="contained" color="secondary" className={classes.button}
          disabled={this.state.status.active_step <= 0}
          onClick={() => { ExecuteRestCall(STOP_BREW, 'POST', (json) => { this.setState({ status: json }) }, this.props) }}
        >
          Stop
      </Button>
        <Button variant="contained" color="secondary" className={classes.button}
          disabled={this.state.status.active_step != 1}
          onClick={() => { ExecuteRestCall(NEXT_STEP_BREW, 'POST', (json) => { this.setState({ status: json }) }, this.props) }}
        >
          Next Step
      </Button>

        <ResponsiveContainer width="100%" height={320} >
          <LineChart data={this.state.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Target" stroke="#82ca9d" />
            <Line type="monotone" dataKey="Current" stroke="#8884d8" activeDot={{ r: 10 }} />
          </LineChart>
        </ResponsiveContainer>

        <MashSettings listOnly={true} brewDay={true} selectedIndex={this.state.status.active_mash_step_index} />
        <BoilSettings listOnly={true} brewDay={true} selectedIndex={this.state.status.active_boil_step_index} />
      </SectionContent>
    )
  }
}

export default withNotifier(withStyles(styles)(Brew));