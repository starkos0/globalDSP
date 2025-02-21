import { Component, EffectRef } from '@angular/core';
import { ElementRef, OnInit, ViewChild, OnDestroy, AfterViewInit, Signal, effect, inject } from '@angular/core';
import * as d3 from "d3";
import { DataManagementService } from '../../services/data-management.service';
import { TransformedItems } from '../../interfaces/transformed-items';
@Component({
  selector: 'app-network-graph',
  standalone: true,
  imports: [],
  templateUrl: './network-graph.component.html',
  styleUrl: './network-graph.component.scss'
})
export class NetworkGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('treeContainer', { static: true }) private treeContainer!: ElementRef;
  private svg: any;
  private g: any;
  private width = 800;
  private height = 300;
  private treeLayout: any;
  private zoom: any;
  private unsubscribeEffect!: () => void;
  private effectRef!: EffectRef;

  constructor(public dataManagement: DataManagementService) {
    this.effectRef = effect(() => {
      
      const data = this.dataManagement.selectedItems();
      if (this.dataManagement.selectedItems().length > 0 && this.dataManagement.isRecipesFormInitialized()) {
        this.updateTree(data);
      }
    });
  }

  ngOnInit(): void {
    this.initSvg();
  }

  ngAfterViewInit(): void {


  }

  private initSvg(): void {
    const element = this.treeContainer.nativeElement;

    this.svg = d3.select<SVGSVGElement, unknown>(element) // <--- Asegurar que es un SVG
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .call(
        d3.zoom<SVGSVGElement, unknown>() // <--- Especificar que es un zoom para SVG
          .on('zoom', (event) => this.g.attr('transform', event.transform))
      )
      .append('g');


    this.treeLayout = d3.tree().size([this.width, this.height]);
  }

  private updateTree(data: TransformedItems[]): void {
    this.svg.selectAll('*').remove(); // Clear previous tree

    const root = d3.hierarchy(data[0], d => d.childs);
    const treeData = this.treeLayout(root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    this.g = this.svg.append('g');

    // Draw links
    this.g.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('x1', (d: d3.HierarchyPointLink<TransformedItems>) => d.source.x)
      .attr('y1', (d: d3.HierarchyPointLink<TransformedItems>) => d.source.y)
      .attr('x2', (d: d3.HierarchyPointLink<TransformedItems>) => d.target.x)
      .attr('y2', (d: d3.HierarchyPointLink<TransformedItems>) => d.target.y)
      .style('stroke', '#aaa');

    const ROOT_SIZE = 40; // 🔹 Tamaño inicial del nodo raíz
    const SCALE_FACTOR = 0.8; // 🔹 Factor de reducción para cada nivel

    // Seleccionar el tooltip que está en el HTML
    const tooltip = d3.select("#tooltip");

    // Draw nodes with images
    // 🔹 Selección de los nodos (imágenes)
    this.g.selectAll('.node')
      .data(nodes)
      .enter().append('image')
      .attr('class', 'node')
      .attr('x', (d: d3.HierarchyPointNode<TransformedItems>) => d.x - (ROOT_SIZE * Math.pow(SCALE_FACTOR, d.depth)) / 2)
      .attr('y', (d: d3.HierarchyPointNode<TransformedItems>) => d.y - (ROOT_SIZE * Math.pow(SCALE_FACTOR, d.depth)) / 2)
      .attr('width', (d: d3.HierarchyPointNode<TransformedItems>) => Math.max(10, ROOT_SIZE * Math.pow(SCALE_FACTOR, d.depth)))
      .attr('height', (d: d3.HierarchyPointNode<TransformedItems>) => Math.max(10, ROOT_SIZE * Math.pow(SCALE_FACTOR, d.depth)))
      .attr('href', (d: d3.HierarchyPointNode<TransformedItems>) => 'assets/' + d.data.IconPath + '.png')
      .on("mouseover", (event: MouseEvent, d: d3.HierarchyPointNode<TransformedItems>) => {
        const [x, y] = d3.pointer(event, this.svg.node());

        tooltip
          .style("opacity", "1")
          .style("visibility", "visible")
          .html(d.data.name)
          .style("left", `${x + 60}px`)
          .style("top", `${y + 10}px`);
      })
      .on("mousemove", (event: MouseEvent) => {
        const [x, y] = d3.pointer(event, this.svg.node());

        tooltip
          .style("left", `${x + 30}px`)
          .style("top", `${y + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", "0").style("visibility", "hidden");
      });

    // 🔹 Selección de etiquetas para `totalValue`
    this.g.selectAll('.value-label')
      .data(nodes)
      .enter().append('text')
      .attr('class', 'value-label')
      .attr('x', (d: d3.HierarchyPointNode<TransformedItems>) => d.x)
      .attr('y', (d: d3.HierarchyPointNode<TransformedItems>) => d.y + 22) // Ubicar debajo del nodo
      .attr('text-anchor', 'middle') // Centrar el texto
      .text((d: d3.HierarchyPointNode<TransformedItems>) => `${d.data.totalValue}`)
      .style('font-size', '10px')
      .style('fill', '#fff'); // Color blanco para que resalte


  }


  ngOnDestroy(): void {
    this.unsubscribeEffect();
  }
}
