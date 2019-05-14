package dragger.controllers;

import java.util.Collection;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dragger.bl.exporter.ChartQueryExporter;
import dragger.contracts.ChartResult;
import dragger.entities.Chart;
import dragger.exceptions.DraggerException;
import dragger.repositories.ChartRepository;

@RestController
public class ChartController {
	@Autowired
	private ChartRepository chartRepository;

	@Autowired
	private ChartQueryExporter exporter;

	@GetMapping("api/charts/executeCountChartQuery")
	public Collection<ChartResult> executeCountChartQuery(@RequestParam long chartId) throws DraggerException {
		return exporter.export(findChartById(chartId));
	}

	@Transactional
	@PutMapping("api/charts/updateChartName")
	public void updateChartName(@RequestParam long chartId, @RequestBody String newName) throws DraggerException {
		findChartById(chartId).setName(newName);
	}

	private Chart findChartById(long chartId) throws DraggerException {
		Optional<Chart> requestedCHart = chartRepository.findById(chartId);

		if (requestedCHart.isPresent()) {
			return requestedCHart.get();
		}

		throw new DraggerException("Chart id:" + chartId + " not found");
	}
}