
<script>
import { Line, mixins } from 'vue-chartjs';

export default {
  extends: Line,
  props: ['chartData'],
  mixins: [mixins.reactiveProp],
  data: () => ({
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
              min: 0,
            },
            gridLines: {
              display: true,
            },
            scaleLabel: {
              labelString: 'Frame',
              display: false, // 悩む
            },
          },
        ],
        xAxes: [
          {
            gridLines: {
              display: false,
            },
            scaleLabel: {
              labelString: 'try',
              display: false, // 悩む
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      tooltips: {
        enabled: false,
      },
      responsive: true,
    },
  }),
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
</script>

