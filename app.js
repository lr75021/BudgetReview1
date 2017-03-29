
function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'Budget.json', true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {

            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(xobj.responseText);
        }
    }
    xobj.send(null);
}

function GetBudgetByYear($scope) {
    loadJSON(function(response) {
        $scope.labels = [];
        $scope.data = [];
        $scope.myData = [];

        var data = JSON.parse(response);

        console.log (">> Begin", $scope.strYear);

        $scope.myData = [];

        console.log($scope.strYear, " : ", data["Y2011"][0].name);

        console.log($scope.strYear, " : ", data[$scope.strYear]["Office of the Premier"]);
        var count = Object.keys(data[$scope.strYear]).length;
        console.log("Count = ", count);

        for (i=0; i<count; i++) {
            valName = data[$scope.strYear][i].name;
            valBudgeted = data[$scope.strYear][i].budgeted;

            $scope.labels[i] = valName;
            $scope.data[i] = valBudgeted;

            $scope.myData[i] = {
                "Name": valName,
                "Budgetted": valBudgeted
            };

            console.log(i, ":", valName, "-", valBudgeted);
        }


        console.log("<< end");
    });
}

function GetBudgetByMinistry($scope) {
    loadJSON(function(response) {
        $scope.labels = [];
        $scope.data = [];
        $scope.myData = [];

        $scope.labels = ['2011', '2012', '2013', '2014', '2015', '2016', '2017'];
        $scope.series = ['Budgeted', 'Actual'];

        var budgeted = [];
        var actual = [];
        var diff = [];

        var data = JSON.parse(response);

        var strYear;
        var year;
        var j = 0;
        console.log (">>>>> GetBudgetByMinistry >>>>>")
        for (year=2011; year<=2017; year++) {
            strYear = "Y"+year;

            for (i in data[strYear]) {
                if (data[strYear][i].name == "Health") {
                    budgeted[j] = data[strYear][i].budgeted;
                    actual[j] = data[strYear][i].actual;
                    if (budgeted[j] != 0)
                        diff[j] = (actual[j] - budgeted[j]) / budgeted[j];
                    else {
                        if (actual[j] == null)
                            diff[j] = null;
                        else
                             diff[j] = 0;
                    }


                    $scope.gridOptions.data[j] = {
                        "Year" : year,
                        "Budgeted": budgeted[j],
                        "Actual": actual[j] //,
                        //"Diff": diff[j]
                    }
                    //
                    console.log("i: ", i);
                    console.log("j: ", j);
                    console.log("Year: ", $scope.gridOptions.data[j].Year);
                    console.log ("Budgeted: ", $scope.gridOptions.data[j].Budgeted);
                    console.log ("actual: ", $scope.gridOptions.data[j].Actual);
                    //
                    j = j+1;
                }
            }
            //valName = data[$scope.strYear][i].name;
            //valBudgeted = data[$scope.strYear][i].budgeted;
        }

        $scope.data = [budgeted, actual];

    });
}

angular
  .module('app', ['ui.router', 'chart.js', 'ui.grid'])
  .config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('Home', {
        url: '/',
        templateUrl: 'Home.html',
        controller: 'homeCtrl'
      })
      .state('Year', {
        url: '/Year',
        templateUrl: 'Year.html',
        controller: 'yearCtrl'
      })
      .state('Ministry', {
        url: '/Ministry',
        templateUrl: 'Ministry.html',
        controller: 'ministryCtrl'
      })
  }
])

.controller('homeCtrl', ['$scope', function ($scope) {
    $scope.title = "Home";
    console.log("<<<<<<<<");
}])

.controller('yearCtrl', ['$scope', function ($scope) {
    $scope.year = 2011;
    $scope.strYear = "Y2011";

    $scope.title = "Budget reviewed by Year";

    $scope.selectedID = 0;

    $scope.years = [];
    for (i=0; i<7; i++) {
        $scope.years[i] = {
            "name": 2011+i,
            "id": i
        }
    }
    $scope.selectedYear = $scope.years[$scope.selectedID];

    $scope.updateYear = function(changedYear) {
         // $scope.selectedYear = $scope.years[$scope.selectedID];
        $scope.year = 2011 + changedYear.id;
        $scope.strYear = "Y" + changedYear.name;     // "Y" + year;
        console.log(" ==== ", $scope.strYear, $scope.year);

        GetBudgetByYear($scope);
    }

    console.log(">>>>>> " + $scope.strYear + " <<<<<<<");

    GetBudgetByYear($scope);

}])

.controller('ministryCtrl', ['$scope', 'uiGridConstants', function ($scope, uiGridConstants) {
    $scope.title = "Budget reviewed by Ministry";

    $scope.labels = [];
    $scope.series = [];
    $scope.data = [];

    $scope.ministries = [
        { "id":0, "name": "Office of the Premier"},
        { "id":1, "name": "Aboriginal Relations and Reconciliation"},
        { "id":2, "name": "Advanced Education"},
        { "id":3, "name": "Agriculture"},
        { "id":4, "name": "Children and Family Development"},
        { "id":5, "name": "Community, Sport and Cultural Development"},
        { "id":6, "name": "Education"}
    ]
    $scope.selectedID = 0;
    $scope.selectedMinistry = $scope.ministries[$scope.selectedID];

    $scope.gridOptions = {
        enableFiltering: true,
        columnDefs: [
            { name: 'Year',
                enableCellEdit: false,
                enableSorting: false,
                enableFiltering: false,
                enableHiding: false
            },
            { name: 'Budgeted',
                enableCellEdit: false,
                enableSorting: false,
                enableFiltering: false,
                enableHiding: false
            },
            { name: 'Actual',
                enableCellEdit: false,
                enableSorting: false,
                enableFiltering: false,
                enableHiding: false
            },
            /*
            { name: 'Diff',
                enableCellEdit: false,
                enableSorting: false,
                enableFiltering: false,
                enableHiding: false,
                //cellFilter: 'percentage'
                cellFilter: 'calculatePercentage'
            },   */
            { name:'Diff', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'calculatePercentage:"Actual":"Budgeted"', sortCellFiltered: true, enableCellEdit: false, enableFiltering: false }
        ]
    };

    $scope.updateMinistry =  function(selectedMinistry) {
        console.log("Select Ministry:", selectedMinistry.name);
    }
    GetBudgetByMinistry($scope);
}])
