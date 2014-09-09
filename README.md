#manSlider#

manSilider is a simple slider plugin.
see more docs on [https://github.com/latel/manSlider]()

If you want to help me with a donation I'll appreciate :-)

---

##Features##
* Theme support, with build-in white, black and orange.
* Orientation support, both horizen and vertical.
* Range support, min max and section.

##Dependence##

1. manSlider depends on [LocalEvent](http://github.com/latel/LocalEvent) ( *yet another EventEmitter* ) for module events handling.


##Quick Start##
1. ###include necessary files into your project###

        <script src="plugin/manSlider/LocalEvent-0.0.1.min.js"></script>
	    <script src="plugin/manSlider/manSlider-0.0.1.min.js"></script>
        <link rel="stylesheet" href="plugin/manSlider/manSlider.css">
        
   *or you can choose to use packed verion ( *which is not recommended* ) :*
   
        <script src="plugin/manSlider/manSlider-0.0.1.packed.min.js"></script>
        <link rel="stylesheet" href="plugin/manSlider/manSlider.css">
        
2. ###Create a wrapper to place your slider###
        <div id="slider"></div>

3. ###default slider###
        $("#slider").manSlider();

##Theme Support##
manSlider comes with theme support, just put your theme css files is put below manSlider.css

        <link rel="stylesheet" href="plugin/manSlider/manSlider.css">
        <link rel="stylesheet" href="plugin/manSlider/manSlider-theme-kitkat.css">
        
then special the theme name within the descriptor:

        $("#slider").manSlider({
            "theme": "kitkat"
        });

##Options##
*To custome almost everything by providing a descriptor.*

- **step** [Intger]

   Determines the size or amount of each interval or step the slider takes between the min 
   and max.
   
- **orientation** [String]

   Determines whether the slider handles move horizontally (min on left, max on right) 
   or vertically (min on bottom, max on top). Possible values: "horizontal", "vertical".

- **value** [Number]

   Determines the value of the slider. 
   
- **range** [String]

   Whether the slider represents a range.
   Multiple types supported:   
   + Boolean: If set to true, the slider will detect if you have two handles and create a styleable range element between these two.
   + String: Either "min" or "max". A min range goes from the slider min to one handle. A max range goes from one handle to the slider max.

- **theme** [String]

   Declare a theme to use. You should proper theme stylesheets as well.

- **min** [Number]
   
   The minimum value of the slider.

- **max** [Number]

   The maxium value of the slider.

*override default options:*

manSlider defaults are stored in ***jQuery.fn.manSlider.defaults***,  
just change them with valid values.



##API##
*to manipulate almost everything.*

- **enable()**

  Enable a slider.
 
- **disable()**

  Disable a slider.

- **destory()**

  Destory a slider, you can whenever retore it by using enable method again.
  
- **set()**

  Set the current value of a slider, this value must be within min and max. 
  
- **get()**

  Reutrn the current value.

- **value**

  Access the current value directly.
  

##Contrubuting##

1. Kezhen Wong <latelx64@gmail.com>
2. Ling Yang <ling.yang@ryzur.com.cn>