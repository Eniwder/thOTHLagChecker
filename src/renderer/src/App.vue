<template>
  <v-app>
    <v-container class="grey lighten-5">
      <v-row no-gutters style="height: 64px">
        <v-col>
          <v-text-field label="IP:PORT" hide-details="auto" @update:model-value="changeIpport" v-model="inputIpport"
            :rules="[ipportRule]"></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters style="height: 48px;margin: 16px; text-align: center;">
        <v-col>
          <v-btn depressed color="blue-grey" raised :disabled="!submitReady" @click="checkLag(true)"
            :loading="checkbtn.progress">
            Check
          </v-btn>
        </v-col>
        <!-- <v-col>
          <v-btn depressed color="blue-grey" raised :disabled="!submitReady" @click="checkLag(true)"
            :loading="checkbtn.progress">
            オートパンチ用Check
          </v-btn>
        </v-col> -->
      </v-row>
      <v-row no-gutters>
        <v-col class="echart-wrapper">
          <VChart class="chart" :option="option" autoresize ref="chart" />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, reactive, nextTick } from 'vue';
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
    data: [1, 2, 3, 4, 5, 6, 7]
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

const ipportRule = computed(() => {
  const pattern =
    /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]):(\d+)$/;
  return pattern.test(inputIpport.value)
    ? true
    : 'Input style [xxx.xxx.xxx.xxx:port]';
});

const submitReady = computed(() => ipportRule.value === true);

function changeIpport() {
  nextTick(() => {
    inputIpport.value = inputIpport.value.trim();
  });
}

function checkLag(isAP) {
  if (!submitReady.value) return;
  checkbtn.progress = true;
  option.series[0].data = [];
  ping(inputIpport.value, isAP);
}

function ping(ipport, isAP) {
  window.ipcRenderer.on('result-ping', (event, arg) => {
    console.log(event, arg);
    if (arg === 'end') {
      window.ipcRenderer.removeAllListeners('result-ping');
      checkbtn.progress = false;
    } else {
      option.series[0].data.push(parseFloat(arg) || 100);
    }
  });
  if (isAP) {
    window.ipcRenderer.send('do-ping-ap', ipport);
  } else {
    window.ipcRenderer.send('do-ping', ipport);
  }
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
  height: 70vh;
}
</style>
