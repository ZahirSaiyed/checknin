import { Line } from "react-chartjs-2";
import { InputData } from "../pages/api/types";
import { Chart, LinearScale } from 'chart.js';
import { CategoryScale, LineElement } from 'chart.js/auto';

Chart.register(CategoryScale, LinearScale, LineElement);

interface RatingChartProps {
  checkins: InputData[];
}

const RatingChart: React.FC<RatingChartProps> = ({ checkins }) => {
  const data = {
    labels: checkins.map((checkin) => new Date(checkin.timeStamp).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: "Rating",
        data: checkins.map((checkin) => checkin.rating).reverse(),
        fill: false,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.8)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
          reverse: true,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          display: false,
        },
        beginAtZero: true,
        max: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      intersect: false,
      mode: "index",
    },
    pointHoverRadius: 8,
    pointHoverBackgroundColor: "#ffffff",
    pointHoverBorderColor: "#ffffff",
    pointHoverBorderWidth: 2,
    pointHitRadius: 10,
    width: "100%",
  };

  return (
    <div className="p-4">
      <div className="bg-black rounded-lg shadow-md p-6" style={{ maxHeight: "400px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default RatingChart;
