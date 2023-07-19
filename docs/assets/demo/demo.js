demo = {
  initPickColor: function() {
    $('.pick-class-label').click(function() {
      var new_class = $(this).attr('new-class');
      var old_class = $('#display-buttons').attr('data-class');
      var display_div = $('#display-buttons');
      if (display_div.length) {
        var display_buttons = display_div.find('.btn');
        display_buttons.removeClass(old_class);
        display_buttons.addClass(new_class);
        display_div.attr('data-class', new_class);
      }
    });
  },

  initChartsPages: async function() {
    let dataUrl = "https://script.google.com/macros/s/AKfycbynE670m0-JLDlSs3nO74XLGsTUrqbTec1-jEH-YZiDXk3bG4t3s2d6J1j644_-75f5/exec?action=get";

    let allData = await fetch(dataUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data.content;
    });

    for (let i = 0; i < 15; i++) {
      let d = new Date(allData[i][1]);
      $(`#last-${i}-1`).html(`${d.getMonth() + 1}月${d.getDate()}日`);
      $(`#last-${i}-0`).html(`${allData[i][0].toLocaleString()} 円`);
    }

    $("#inu-records").html(allData.length);

    let lastUpdateStrList = ["今日", "昨日", "一昨日", "3日前", "4日前", "5日前", "6日前"];
    let lastUpdate = new Date(allData[0][1]);
    console.log(Date.parse(lastUpdate));

    let lastUpdateStr = `${lastUpdate.getMonth() + 1}月${lastUpdate.getDate()}日`;
    if(lastUpdateStrList.length > (Date.now() - lastUpdate.getTime()) / 86400000) {
      lastUpdateStr = lastUpdateStrList[Math.floor((Date.now() - lastUpdate.getTime()) / 86400000) - 1];
    }
    $(".inu-last-update").html(`&nbsp;最終更新: ${lastUpdateStr}`);
    
    // let monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthLabels = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    let monthIdxList = [
      (lastUpdate.getMonth() + 1) % 12,
      (lastUpdate.getMonth() + 2) % 12,
      (lastUpdate.getMonth() + 3) % 12,
      (lastUpdate.getMonth() + 4) % 12,
      (lastUpdate.getMonth() + 5) % 12,
      (lastUpdate.getMonth() + 6) % 12,
      (lastUpdate.getMonth() + 7) % 12,
      (lastUpdate.getMonth() + 8) % 12,
      (lastUpdate.getMonth() + 9) % 12,
      (lastUpdate.getMonth() + 10) % 12,
      (lastUpdate.getMonth() + 11) % 12,
      (lastUpdate.getMonth()) % 12,
    ];
    let milib = (12 - (monthIdxList[0])) % 12;
    let monthIdxListInv = [
      milib,
      (milib + 1) % 12,
      (milib + 2) % 12,
      (milib + 3) % 12,
      (milib + 4) % 12,
      (milib + 5) % 12,
      (milib + 6) % 12,
      (milib + 7) % 12,
      (milib + 8) % 12,
      (milib + 9) % 12,
      (milib + 10) % 12,
      (milib + 11) % 12,
    ];

    let spentAll = 0;
    allData.forEach((row) => {
      spentAll += row[0];
    });
    let spentAllStr = `${spentAll.toLocaleString()} 円`;

    $("#inu-total").html(spentAllStr);

    let monthSpentAll = [];
    let monthSpentAllTotal = 0;
    let lastYearMonth;
    allData.forEach((row) => {
      console.log(row);
      if(lastYearMonth != row[1].substring(0, 7)) {
        monthSpentAll.push(row[0]);
        lastYearMonth = row[1].substring(0, 7);
      } else {
        monthSpentAll[monthSpentAll.length - 1] += row[0];
      }
      monthSpentAllTotal += row[0];
    });

    let monthSpentAllAverage = monthSpentAllTotal / monthSpentAll.length;

    console.log(monthSpentAllAverage);
    let averageUnderZero = `.<small>${Math.round((monthSpentAllAverage % 1) * 100)}</small>`
    $("#inu-average").html(`${Math.floor(monthSpentAllAverage).toLocaleString()}${averageUnderZero} 円`);
    

    let monthSpentLastYear = [0,0,0,0,0,0,0,0,0,0,0,0];
    let monthSpentLastYearSum = [0,0,0,0,0,0,0,0,0,0,0,0];
    allData.forEach((row) => {
      if(lastUpdate.getTime() - new Date(row[1]).getTime() > 365 * 24 * 60 * 60 * 1000) {
        return;
      }
      
      console.log(new Date(row[1]).getMonth());
      let monthIdx = monthIdxListInv[new Date(row[1]).getMonth()];
      monthSpentLastYear[monthIdx] += row[0];
    });
    monthSpentLastYearSum[0] = monthSpentLastYear[0];
    for (let i = 1; i < 12; i++) {
      monthSpentLastYearSum[i] = monthSpentLastYearSum[i-1] + monthSpentLastYear[i];
    }

    console.log(monthIdxList);
    console.log(monthIdxListInv);
    console.log(monthSpentLastYear);
    console.log(monthSpentLastYearSum);

    chartColor = "#FFFFFF";

    var ctx1 = document.getElementById('chartHours').getContext("2d");

    var myChart1 = new Chart(ctx1, {
      type: 'line',

      data: {
        labels: monthIdxList.map((monthIdx) => {
          if(lastUpdate.getMonth() < monthIdx) {
            return `${lastUpdate.getFullYear() - 1}/${monthLabels[monthIdx]}`;
          } else {
            return `${lastUpdate.getFullYear()}/${monthLabels[monthIdx]}`;
          }
        }),
        datasets: [{
            label: "月次支出",
            borderColor: '#4acccd',
            // backgroundColor: "#6bd098",
            backgroundColor: 'transparent',
            // pointBorderColor: '#51CACF',
            pointRadius: 1,
            pointHoverRadius: 2,
            pointBorderWidth: 4,

            borderWidth: 3,
            data: monthSpentLastYear
          }, {
            label: "累計支出",
            borderColor: "#ef8157",
            // backgroundColor: "#6bd098",
            backgroundColor: 'transparent',

            pointRadius: 1,
            pointHoverRadius: 2,
            pointBorderWidth: 4,

            borderWidth: 3,
            data: monthSpentLastYearSum
          }
        ]
      },
      options: {
        legend: {
          display: false
        },

        tooltips: {
          // enabled: false
          callbacks: {
            label: function(tooltipItem, data){

                return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') +' 円';

            }
          }
        },

        scales: {
          yAxes: [{

            ticks: {
              // fontColor: "#9f9f9f",
              beginAtZero: true,
              // maxTicksLimit: 5,
              //padding: 20
              stepSize: 100000,
              callback: function(label, index, labels) { /* ここです */
                return label.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') +' 円';
              }
            },
            gridLines: {
              // drawBorder: false,
              zeroLineColor: "#ccc",
              // color: 'rgba(255,255,255,0.05)'
            },
          }],

          xAxes: [{
            barPercentage: 1.6,
            gridLines: {
              // drawBorder: false,
              color: 'rgba(255,255,255,0.1)',
              zeroLineColor: "transparent",
              display: false,
            },
            ticks: {
              padding: 20,
              fontColor: "#9f9f9f"
            }
          }]
        },
      }
    });

    return;

    var ctx2 = document.getElementById('chartEmail').getContext("2d");

    var myChart2 = new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: [1, 2, 3],
        datasets: [{
          label: "Emails",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: [
            '#e3e3e3',
            '#4acccd',
            '#fcc468',
            '#ef8157'
          ],
          borderWidth: 0,
          data: [342, 480, 530, 120]
        }]
      },

      options: {

        legend: {
          display: false
        },

        pieceLabel: {
          render: 'percentage',
          fontColor: ['white'],
          precision: 2
        },

        tooltips: {
          enabled: false
        },

        scales: {
          yAxes: [{

            ticks: {
              display: false
            },
            gridLines: {
              drawBorder: false,
              zeroLineColor: "transparent",
              color: 'rgba(255,255,255,0.05)'
            }

          }],

          xAxes: [{
            barPercentage: 1.6,
            gridLines: {
              drawBorder: false,
              color: 'rgba(255,255,255,0.1)',
              zeroLineColor: "transparent"
            },
            ticks: {
              display: false,
            }
          }]
        },
      }
    });

    return;

    var speedCanvas = document.getElementById("speedChart");

    var dataFirst = {
      data: [0, 19, 15, 20, 30, 40, 40, 50, 25, 30, 50, 70],
      fill: false,
      borderColor: '#fbc658',
      backgroundColor: 'transparent',
      pointBorderColor: '#fbc658',
      pointRadius: 4,
      pointHoverRadius: 4,
      pointBorderWidth: 8,
    };

    var dataSecond = {
      data: [0, 5, 10, 12, 20, 27, 30, 34, 42, 45, 55, 63],
      fill: false,
      borderColor: '#51CACF',
      backgroundColor: 'transparent',
      pointBorderColor: '#51CACF',
      pointRadius: 4,
      pointHoverRadius: 4,
      pointBorderWidth: 8
    };

    var speedData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [dataFirst, dataSecond]
    };

    var chartOptions = {
      legend: {
        display: false,
        position: 'top'
      }
    };

    var lineChart = new Chart(speedCanvas, {
      type: 'line',
      hover: false,
      data: speedData,
      options: chartOptions
    });
  },

  showNotification: function(from, align) {
    color = 'primary';

    $.notify({
      icon: "nc-icon nc-bell-55",
      message: "Welcome to <b>Paper Dashboard</b> - a beautiful bootstrap dashboard for every web developer."

    }, {
      type: color,
      timer: 8000,
      placement: {
        from: from,
        align: align
      }
    });
  }

};