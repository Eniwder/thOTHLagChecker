<template>
  <v-app>
    <v-container class="grey lighten-5">
      <v-row no-gutters style="height: 64px">
        <v-col>
          <v-text-field label="IP:PORT" hide-details="auto" @keydown="changeIpport" v-model="inputIpport"
            :rules="[ipportRule]" @keydown.enter="checkLag"></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters style="height: 48px;margin: 16px; text-align: center;">
        <v-col>
          <v-btn depressed color="blue-grey" raised :disabled="!submitReady" @click="checkLag"
            :loading="checkbtn.progress">
            Check
          </v-btn>
        </v-col>
        <v-col>
          <v-btn depressed color="blue-grey" raised :disabled="!submitReady" @click="checkLag"
            :loading="checkbtn.progress">
            オートパンチ用Check
          </v-btn>
        </v-col>
      </v-row>
      <!-- <v-row no-gutters style="height: 190px">
        <v-col>
          <v-data-table :headers="histories.headers" :items="histories.body" :items-per-page="3" hide-default-footer
            class="elevation-1"></v-data-table>
        </v-col>
      </v-row> -->
      <v-row no-gutters>
        <v-col class="echart-wrapper">
          <VChart class="chart" :option="option" autoresize ref="chart" />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, reactive } from 'vue';
import VChart from 'vue-echarts';
import { LineChart } from 'echarts/charts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  TransformComponent,
  ToolboxComponent,
} from 'echarts/components';
use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  TransformComponent,
  CanvasRenderer,
]);

const chart = ref(null);

const option = reactive({
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      return params[0].value + ' F';
    },
  },
  xAxis: {
    type: 'category',
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value} F'
    }
  },
  series: [
    {
      data: [],
      type: 'line',
      color: 'gold',
    }
  ]
});
const inputIpport = ref('');
const chartRef = ref(null);
const checkbtn = reactive({ progress: false });
// const histories = reactive({
//   headers: [
//     { text: 'target', align: 'start', sortable: false, value: 'ipport' },
//     { text: '1', value: '1' },
//     { text: '2', value: '2' },
//     { text: '3', value: '3' },
//     { text: '4', value: '4' },
//     { text: '5', value: '5' },
//     { text: '6', value: '6' },
//     { text: '7', value: '7' },
//     { text: '8', value: '8' },
//     { text: '9', value: '9' },
//     { text: 'avg', value: 'avg' },
//   ],
//   body: [],
// });

const ipportRule = computed(() => {
  const pattern =
    /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]):(\d+)$/;
  return pattern.test(inputIpport.value)
    ? true
    : 'Input style [xxx.xxx.xxx.xxx:port]';
});

const submitReady = computed(() => ipportRule.value === true);

function changeIpport() {
  inputIpport.value = inputIpport.value.trim();
}

function checkLag() {
  if (!submitReady.value) return;
  checkbtn.progress = true;
  option.series[0].data = [];
  ping(inputIpport.value);
}

function ping(ipport) {
  window.ipcRenderer.on('result-ping', (event, arg) => {
    if (arg === 'end') {
      window.ipcRenderer.removeAllListeners('result-ping');
      const result = option.series[0].data;
      checkbtn.progress = false;
      // なんかヘッダーが表示されないしいらない気もしてきたから一旦消す
      // histories.body.unshift({
      //   ipport: ipport,
      //   1: ('' + (result[0] || 100)).substring(0, 3).padEnd(2, 0),
      //   2: ('' + (result[1] || 100)).substring(0, 3).padEnd(2, 0),
      //   3: ('' + (result[2] || 100)).substring(0, 3).padEnd(2, 0),
      //   4: ('' + (result[3] || 100)).substring(0, 3).padEnd(2, 0),
      //   5: ('' + (result[4] || 100)).substring(0, 3).padEnd(2, 0),
      //   6: ('' + (result[5] || 100)).substring(0, 3).padEnd(2, 0),
      //   7: ('' + (result[6] || 100)).substring(0, 3).padEnd(2, 0),
      //   8: ('' + (result[7] || 100)).substring(0, 3).padEnd(2, 0),
      //   9: ('' + (result[8] || 100)).substring(0, 3).padEnd(2, 0),
      //   avg:
      //     (
      //       result.reduce((acc, v) => acc + (v || 100), 0) / result.length
      //     )
      //       .toFixed(2)
      //       .padEnd(2, 0) + ' F',
      // });
    } else {
      option.series[0].data.push(parseFloat(arg) || 100);
      const chart = chartRef.value?.chartInstance;
      if (chart) chart.update();
    }
  });
  window.ipcRenderer.send('do-ping', ipport);
}

onBeforeUnmount(() => {
  window.ipcRenderer.removeAllListeners('result-ping');
});
</script>

<style>
.v-data-table {
  min-width: 530px;
}

.echart-wrapper {
  width: 100vw;
  height: 50vh;
}
</style>
