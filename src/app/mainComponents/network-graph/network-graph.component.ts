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
      console.log("AAAAAAAAAAAAAAAAAAAAA")
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

    // Draw nodes with images
      this.g.selectAll('.node')
      .data(nodes)
      .enter().append('image')
      .attr('class', 'node')
      .attr('x', (d: d3.HierarchyPointNode<TransformedItems>) => d.x - 15) // Ajusta la posición
      .attr('y', (d: d3.HierarchyPointNode<TransformedItems>) => d.y - 15)
      .attr('width', 30) // Tamaño de la imagen
      .attr('height', 30)
      .attr('href', (d: d3.HierarchyPointNode<TransformedItems>) => 'assets/' + d.data.IconPath + '.png') // Accede a la imagen
      .style('pointer-events', 'all'); // Habilitar interacción si es necesario


    // Add labels
    this.g.selectAll('.label')
      .data(nodes)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', (d: d3.HierarchyPointNode<TransformedItems>) => d.x + 15)
      .attr('y', (d: d3.HierarchyPointNode<TransformedItems>) => d.y)
      .text((d: d3.HierarchyPointNode<TransformedItems>) => d.data.name)
      .style('font-size', '12px')
      .style('fill', '#ccc');

  }

  ngOnDestroy(): void {
    this.unsubscribeEffect();
  }
}
