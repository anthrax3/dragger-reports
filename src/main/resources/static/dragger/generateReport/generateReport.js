angular
		.module("dragger")
		.controller(
				"generateReportController",
				function($scope, $http, $mdDialog) {
					$scope.reports = [];
					$scope.reportsSearchResults = [];
					$scope.selectedReport = null;
					$scope.selectedReportSearchText = "";
					$scope.loading = false;
					$scope.duplicates = {
						showDuplicates : false
					};
					$scope.filters = [];
					$scope.operators = [];
					$scope.dataTypes = {
						VARCHAR : {
							name : "TEXT",
							multivalue : true,
							getValue : function() {
								return;
							}
						},
						NUMERIC : {
							name : "NUMBER",
							multivalue : false,
							getValue : function() {
								return;
							}
						},
						BOOLEAN : {
							multivalue : true,
							getValues : function() {
								return [ {
									name : 'TRUE',
									value : 'TRUE'
								}, {
									name : 'FALSE',
									value : 'FALSE'
								} ];
							}
						},
						DATE : {
							name : "DATE",
							multivalue : false,
							getValue : function() {
								return;
							}
						}
					};

					$scope.filtered = "";

					$http({
						method : 'GET',
						url : '/api/reports'
					}).then(
							function successCallback(response) {
								angular.forEach(
										response.data._embedded.reports,
										function(report) {
											$scope.reports.push(report);
										});
										$scope.reportsSearchResults = $scope.reports;
							});

					$http({
						method : 'GET',
						url : '/api/filters'
					}).then(
							function successCallback(response) {
								angular.forEach(
										response.data._embedded.filters,
										function(filter) {
											$scope.operators.push(filter)
										});
							});

					$scope.addFilter = function() {
						$scope.filters.push({
							"rawValue" : null,
							"selectValue" : null,
							"value" : null,
							"filter" : null,
							"column" : null,
							"searchTerm" : null,
							"valueList": []
						});
						$scope.filtered = "Filtered";
					};

					$scope.removeFilter = function(filterIndex) {
						$scope.filters.splice(filterIndex, 1);
						$scope.filtered = $scope.filters.length > 0 ? "Filtered"
								: "";
					};

					$scope.changeReport = function() {
						$scope.filters = [];
						$scope.selectedReport.columns = [];
						var report = $scope.selectedReport;

						if (report && report.query && report.query._links && report.query._links.columns && Array.isArray(report.query._links.columns)) {
							angular.forEach(report.query._links.columns,
									function(column) {
										var columnDataPromise = $http({
											method : 'GET',
											url : column.href
										}).then(
												function successCallback(
														response) {
													return response.data;
												});
										columnDataPromise.then(function(
												response) {
											if (report.columns == undefined) {
												report.columns = [];
											}

											report.columns.push(response);
										})
									}, report);
						} else {
							$scope.handleReportColumn({
								"href" : report.query._links.columns.href
							}, report);
						}
					}

					$scope.filterSearch = function(filterIndex, searchTerm)
                    {
                        if(searchTerm === null || searchTerm === undefined)
                        {
                            $scope.searchTerm = '';
                            return false;
                        }

                        $scope.filters[filterIndex].searchList = [];
                        $scope.filters[filterIndex].valueList.forEach(function(value)
                        {
                            if(value.toLowerCase().includes(searchTerm.toLowerCase()))
                            {
                                $scope.filters[filterIndex].searchList.push(value);
                            }
                        })
                    }

                    $scope.reportSearch = function(filterIndex, searchTerm)
                    {
                        if(searchTerm === null || searchTerm === undefined)
                        {
                            $scope.selectedReportSearchText = '';
                            return false;
                        }

                        $scope.reportsSearchResults = [];
                        $scope.reports.forEach(function(report)
                        {
                            if(report.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            {
                                $scope.reportsSearchResults.push(report);
                            }
                        })
                    }

					$scope.clearSearchTerm = function(filterIndex)
					{
					    $scope.filters[filterIndex].searchTerm = '';
					}

					$scope.loadValues = function(ev, filterIndex)
					{
                                $http({
                                    method : 'GET',
                                    url : '/api/columns/suggestValues?columnId='
                                    + $scope.filters[filterIndex].column.columnId
                                }).then(
                                        function successCallback(response) {
                                            $scope.filters[filterIndex].valueList = response.data;
                                            $scope.filters[filterIndex].searchList = response.data;
                                        },
                                        function successCallback(response) {
                                        $mdDialog.show(
                                              $mdDialog.alert()
                                                .clickOutsideToClose(true)
                                                .title('')
                                                .textContent('אין ערכים להצעה עבור עמודה זו')
                                                .ariaLabel('Alert Dialog Demo')
                                                .ok('סבבה')
                                                .targetEvent(ev));
                                        });
					}

					$scope.changeColumn = function(ev,filterIndex) {
						$scope.filters[filterIndex].selectValue = null;
						$scope.loadValues(ev, filterIndex);
//						if($scope.filters[filterIndex].comboplete)
//						{
//						    $scope.filters[filterIndex].comboplete.destroy();
//						}
//                        var comboplete = new Awesomplete('#columnValueDropDown' + filterIndex, {
//                            minChars: 0,
//                        });
//                        comboplete.maxItems = 1000000;
//                        $scope.filters[filterIndex].comboplete = comboplete;
//
//                        Awesomplete.$('#dropdown-btn' + filterIndex).addEventListener("click", function() {
//                            if(comboplete._list.length === 0)
//                            {
//                                        }
//                            });
//
//
//                            if (comboplete.ul.childNodes.length === 0) {
//                                comboplete.minChars = 0;
//                                comboplete.evaluate();
//                            }
//                            else if (comboplete.ul.hasAttribute('hidden')) {
//                                comboplete.open();
//                            }
//                            else {
//                                comboplete.close();
//                            }
//
//
//                        Awesomplete.$('#dropdown-btn' + filterIndex).addEventListener('focusout',function(){
//                                                        if (!comboplete.ul.hasAttribute('hidden')) {
//                                                                comboplete.close();
//                                                        }
//                                                    });
					}

					$scope.handleReportColumn = function(column, report) {
						var columnDataPromise = $http({
							method : 'GET',
							url : column.href
						}).then(function successCallback(response) {
							return response.data;
						});
						columnDataPromise.then(function(response) {
							if (report.columns == undefined) {
								report.columns = [];
							}
							report.columns.push(response);
						})
					}

					$scope.downloadUrl = function(ev) {
						var validationCheck = true;
						angular
								.forEach(
										$scope.filters,
										function(filter, index) {
											if (filter.column && $scope.dataTypes[filter.column.dataType].multivalue) {
//												filter.value = Awesomplete.$("#columnValueDropDown"+index).value;
												filter.value = filter.selectValue;
											} else {
												filter.rawValue = filter.rawValue;
											}

											if (!filter.filter) {
												validationCheck = false;
												$mdDialog.show(
                                                      $mdDialog.alert()
                                                        .clickOutsideToClose(true)
                                                        .title('')
                                                        .textContent(" האופרטור בשורה "
														+ (index + 1)
														+ " לא אמור להיות ריק ")
                                                        .ariaLabel('Alert Dialog Demo')
                                                        .ok('סבבה')
                                                        .targetEvent(ev)
                                            );
												return;
											} else if (!filter.column) {
												validationCheck = false;
												$mdDialog.show(
                                                      $mdDialog.alert()
                                                        .clickOutsideToClose(true)
                                                        .title('')
                                                        .textContent(" העמודה בשורה "
														+ (index + 1)
														+ " לא אמורה להיות ריקה ")
                                                        .ariaLabel('Alert Dialog Demo')
                                                        .ok('סבבה')
                                                        .targetEvent(ev)
                                            );
												return;
											} else if (!filter.value) {
												validationCheck = false;
												$mdDialog.show(
                                                      $mdDialog.alert()
                                                        .clickOutsideToClose(true)
                                                        .title('')
                                                        .textContent(" הערך בשורה"
														+ (index + 1)
														+ " לא אמור להיות ריק ")
                                                        .ariaLabel('Alert Dialog Demo')
                                                        .ok('סבבה')
                                                        .targetEvent(ev)
                                            );
												return;
											}
											filter.columnId = filter.column.columnId;
											filter.filterId = filter.filter.id;
										});

						if (validationCheck) {
							$scope.loading = true;

							$http(
									{
										method : 'POST',
										url : '/api/reports/generateFilteredReport?reportId='
												+ $scope.selectedReport.id
												+ '&showDuplicates='
												+ $scope.duplicates.showDuplicates,
										data : $scope.filters,
										responseType : 'arraybuffer'
									})
									.then(
											function(data) {
												var headers = data.headers();

												var fileNameHeader = headers['content-disposition']
														.split(';')[1].trim()
														.split('=')[1];

												var filename = decodeURIComponent(fileNameHeader
														.replace(/"/g, ''));
												var contentType = headers['content-type'];

												var linkElement = document
														.createElement('a');
												try {
													var blob = new Blob(
															[ data.data ],
															{
																type : contentType
															});
													var url = window.URL
															.createObjectURL(blob);

													linkElement.setAttribute(
															'href', url);
													linkElement.setAttribute(
															"download",
															filename);

													var clickEvent = new MouseEvent(
															"click",
															{
																"view" : window,
																"bubbles" : true,
																"cancelable" : false
															});
													linkElement
															.dispatchEvent(clickEvent);
												} catch (ex) {
													console.log(ex);
												}
												$scope.loading = false;
											}).error(function(data) {
										console.log(data);
										$scope.loading = false;
									});
						}
					}
				});
