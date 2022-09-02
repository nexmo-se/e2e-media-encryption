// @flow
import LM, { alignOptions, Options } from "opentok-layout-js";

export interface ILayoutManager {
  container: string;
  manager: any;
}

class LayoutManager implements ILayoutManager{
  container: string;
  manager: any;

  constructor(container:string){
    this.container = container;
  }

  options: Options = {
    maxRatio: 3/2,             // The narrowest ratio that will be used (default 2x3)
    minRatio: 9/16,            // The widest ratio that will be used (default 16x9)
    fixedRatio: false,         // If this is true then the aspect ratio of the video is maintained and minRatio and maxRatio are ignored (default false)
    scaleLastRow: true,        // If there are less elements on the last row then we can scale them up to take up more space
    alignItems: 'center',      // Can be 'start', 'center' or 'end'. Determines where to place items when on a row or column that is not full
    bigClass: "OT_big",        // The class to add to elements that should be sized bigger
    bigPercentage: 0.8,        // The maximum percentage of space the big ones should take up
    minBigPercentage: 0,       // If this is set then it will scale down the big space if there is left over whitespace down to this minimum size
    bigFixedRatio: false,      // fixedRatio for the big ones
    bigScaleLastRow: true,     // scale last row for the big elements
    bigAlignItems: 'center',   // How to align the big items
    smallAlignItems: 'center', // How to align the small row or column of items if there is a big one
    maxWidth: Infinity,        // The maximum width of the elements
    maxHeight: Infinity,       // The maximum height of the elements
    smallMaxWidth: Infinity,   // The maximum width of the small elements
    smallMaxHeight: Infinity,  // The maximum height of the small elements
    bigMaxWidth: Infinity,     // The maximum width of the big elements
    bigMaxHeight: Infinity,    // The maximum height of the big elements
    bigMaxRatio: 3/2,          // The narrowest ratio to use for the big elements (default 2x3)
    bigMinRatio: 9/16,         // The widest ratio to use for the big elements (default 16x9)
    bigFirst: true,            // Whether to place the big one in the top left (true) or bottom right (false).
                               // You can also pass 'column' or 'row' to change whether big is first when you are in a row (bottom) or a column (right) layout
    animate: true,             // Whether you want to animate the transitions using jQuery (not recommended, use CSS transitions instead)
    window: window,            // Lets you pass in your own window object which should be the same window that the element is in
    ignoreClass: 'OT_ignore',  // Elements with this class will be ignored and not positioned. This lets you do things like picture-in-picture
    onLayout: undefined,            // A function that gets called every time an element is moved or resized, (element, { left, top, width, height }) => {} 
};


  init(){
    const element = document.getElementById(this.container);
    if(element) this.manager = LM(element, this.options);
    else throw new Error("Cannot find container");
  }

  layout(){
    if(!this.manager) this.init();
    this.manager.layout();
    console.log("this manager", this.manager)
    console.log(`Layouting ${this.container}`)
  }
}
export default LayoutManager;