<template>
  <v-app>
    <v-container class="grey lighten-5">
      <v-row no-gutters style="height: 64px">
        <v-text-field
          label="IP:PORT"
          hide-details="auto"
          @keydown="changeIpport"
          v-model="inputIpport"
          :rules="ipportRule"
          v-on:keydown.enter="checkLag"
        ></v-text-field>
      </v-row>
      <v-row no-gutters style="height: 48px">
        <v-btn
          depressed
          color="blue-grey"
          raised
          :disabled="!submitReady"
          @click="checkLag"
          :loading="checkbtn.progress"
        >
          Check
        </v-btn>
      </v-row>
      <v-row no-gutters style="height: 190px">
        <v-data-table
          :headers="histories.headers"
          :items="histories.body"
          :items-per-page="3"
          hide-default-footer
          class="elevation-1"
        ></v-data-table>
      </v-row>

      <v-row no-gutters>
        <div class="chart">
          <pingChart
            :chartData="chartData"
            :height="parseInt(200)"
            :width="parseInt(530)"
            ref="chart"
          ></pingChart>
        </div>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import PingChart from './components/PingChart';

export default {
  name: 'App',

  components: {
    PingChart,
  },

  computed: {
    ipportRule() {
      const pattern = /^(\d\d?\d?)\.(\d\d?\d?)\.(\d\d?\d?)\.(\d\d?\d?):(\d+)$/;
      return pattern.test(this.inputIpport)
        ? [true]
        : ['Input style [xxx.xxx.xxx.xxx:port]'];
    },
    submitReady() {
      return this.ipportRule[0] === true;
    },
  },

  methods: {
    changeIpport() {
      const self = this;
      process.nextTick(() => {
        self.inputIpport = self.inputIpport.trim();
      });
    },
    checkLag() {
      if (!this.submitReady) return;
      this.checkbtn.progress = true;
      this.chartData.datasets[0].data.splice(
        -this.chartData.datasets[0].data.length
      );
      this.$refs.chart.$data._chart.update();
      // this.dummyCheckLag();
      this.ping(this.inputIpport);
    },
    ping(ipport) {
      const self = this;
      window.ipcRenderer.on('result-ping', (event, arg) => {
        if (arg === 'end') {
          window.ipcRenderer.removeAllListeners('result-ping');
          const result = self.chartData.datasets[0].data;
          self.checkbtn.progress = false;
          self.histories.body.unshift({
            ipport: ipport,
            1: ('' + result[0] || 100).substr(0, 3).padEnd(2, 0),
            2: ('' + result[1] || 100).substr(0, 3).padEnd(2, 0),
            3: ('' + result[2] || 100).substr(0, 3).padEnd(2, 0),
            4: ('' + result[3] || 100).substr(0, 3).padEnd(2, 0),
            5: ('' + result[4] || 100).substr(0, 3).padEnd(2, 0),
            avg:
              (
                '' +
                result.reduce((acc, v) => acc + (v || 100), 0) / result.length
              )
                .substr(0, 3)
                .padEnd(2, 0) + ' F',
          });
        } else {
          self.chartData.datasets[0].data.push(parseFloat(arg) || 100);
          self.$refs.chart.$data._chart.update();
        }
      });
      window.ipcRenderer.send('do-ping', ipport);
    },

    dummyCheckLag() {
      const self = this;
      const result = [];
      for (let i = 1; i <= 5; i++) {
        setTimeout(() => {
          const v = Math.random() * 5;
          result.push(v);
          self.chartData.datasets[0].data.push(v);
          self.$refs.chart.$data._chart.update();
        }, 1000 * i);
      }
      setTimeout(() => {
        self.checkbtn.progress = false;
        self.histories.body.unshift({
          ipport: 'xxxx',
          1: result[0],
          2: result[1],
          3: result[2],
          4: result[3],
          5: result[4],
          avg: result.reduce((acc, v) => acc + v) / result.length,
        });
      }, 5100);
    },
  },

  data: () => ({
    checkbtn: {
      progress: false,
    },
    inputIpport: '',
    chartData: {
      labels: ['1', '2', '3', '4', '5'],
      datasets: [
        {
          data: [],
          lineTension: 0,
          borderColor: 'rgba(255, 100, 100, 1)',
          fill: false,
        },
      ],
    },
    histories: {
      headers: [
        {
          text: 'target',
          align: 'start',
          sortable: false,
          value: 'ipport',
        },
        { text: '1', value: '1' },
        { text: '2', value: '2' },
        { text: '3', value: '3' },
        { text: '4', value: '4' },
        { text: '5', value: '5' },
        { text: 'avg', value: 'avg' },
      ],
      body: [{}],
    },
  }),
};
</script>


<style>
.v-data-table {
  min-width: 530px;
}
</style>