import { Component } from '@angular/core';

import { Point } from '../game/point';
import { Grid } from '../game/grid';
import { BuildingType } from '../game/building-type';
import { DemolishBuildingType } from '../game/demolish-building-type';
import { RoadBuildingType } from '../game/road-building-type';
import { Building } from '../game/building';
import { Road } from '../game/road';

import { City } from 'src/game/city';

import { BuildingPaletteComponent } from './building-palette.component';

@Component({
  selector: 'app-root',
  //standalone: true,
  //imports: [],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host:{
    "(mousemove)": "onMouseMove($event)"
  }
})

export class AppComponent {
  title = 'City @ Atanas Laskov';
  grid = new Grid(new Point(100, 100));
  city = new City(this.grid);

  currentBuildingTool = new Building();
  mousePos = new Point();
  gizmoRadius = this.grid.getDimension().x*1.5;

  public buildingToolSelectedEvent(bt: BuildingType) {
    this.currentBuildingTool = bt instanceof RoadBuildingType ? new Road(bt) : new Building(bt);
    this.currentBuildingTool.setPos( this.getMouseCenteredBuildingPos() );
  }

  public placeBuilding(buildingPalette: BuildingPaletteComponent) {
    buildingPalette.hoverOut();
    
    if( this.isToolDemolish() ) {
      this.city.demolish(this.currentBuildingTool.getOccupiedArea());
      this.finishBuildingToolAction(buildingPalette);
    }
    else if( !this.currentBuildingTool.isEmptyType())   {
      if( this.city.place( this.currentBuildingTool ) ) {

        // If this is the road tool..
        if ( this.isToolRoad() ) {
          // Automatically pick up a new piece of road
          this.currentBuildingTool = new Road( this.currentBuildingTool.getType() );
        }
        else {
          // Otherwise building is placed, finish with the tool
          this.finishBuildingToolAction(buildingPalette);
        }
      }
    }
    else {
      buildingPalette.hideSubMenu();
      this.finishBuildingToolAction(buildingPalette);
    }
  }

  finishBuildingToolAction(buildingPalette: BuildingPaletteComponent) {
    this.currentBuildingTool = new Building();
    buildingPalette.finishToolAction();
  }

  isToolRoad() {
    return this.currentBuildingTool.getType() instanceof RoadBuildingType;
  }

  isToolDemolish() {
    return this.currentBuildingTool.getType() instanceof DemolishBuildingType;
  }

  onMouseMove(e: MouseEvent) {
    this.mousePos = new Point(e.clientX, e.clientY);
    this.currentBuildingTool.setPos( this.getMouseCenteredBuildingPos() );
  }

  getMouseCenteredPosition(size: Point): Point {
    return Point.getCenteredPosition(this.mousePos, size);
  }

  getMouseCenteredBuildingPos(): Point {
    if (this.isToolRoad()) {
      return this.grid.snap(this.getMouseCenteredPosition(this.grid.getDimension()));
    }
    return this.getMouseCenteredPosition(this.currentBuildingTool.getType().getImageSize());
  }

  getMouseCenteredGizmoPos(): Point {
    let pos = this.getMouseCenteredPosition(new Point(this.gizmoRadius*2, this.gizmoRadius*2));
    
    if (this.isToolRoad()) {
      return this.grid.snap(pos);
    }
    return pos;
  }
}
