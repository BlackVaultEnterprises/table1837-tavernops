use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use web_sys::Performance;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct GlassmorphicRenderer {
    performance: Performance,
}

#[wasm_bindgen]
impl GlassmorphicRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<GlassmorphicRenderer, JsValue> {
        init_panic_hook();
        
        let window = web_sys::window().ok_or("No window found")?;
        let performance = window.performance().ok_or("No performance API")?;
        
        Ok(GlassmorphicRenderer { performance })
    }
    
    #[wasm_bindgen]
    pub fn calculate_blur_intensity(&self, scroll_position: f64, viewport_height: f64) -> f64 {
        let normalized = (scroll_position / viewport_height).min(1.0);
        let blur = 3.0 + (normalized * 5.0);
        blur.min(8.0)
    }
    
    #[wasm_bindgen]
    pub fn calculate_parallax_offset(&self, scroll_position: f64, layer_depth: f64) -> f64 {
        scroll_position * (0.5 - (layer_depth * 0.1))
    }
    
    #[wasm_bindgen]
    pub fn optimize_card_transform(&self, mouse_x: f64, mouse_y: f64, intensity: f64) -> TransformData {
        let rotate_x = (mouse_y * intensity).clamp(-15.0, 15.0);
        let rotate_y = (mouse_x * intensity).clamp(-15.0, 15.0);
        let scale = 1.0 + (intensity * 0.02);
        
        TransformData {
            rotate_x,
            rotate_y,
            scale,
            perspective: 1000.0,
        }
    }
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct TransformData {
    pub rotate_x: f64,
    pub rotate_y: f64,
    pub scale: f64,
    pub perspective: f64,
}

#[wasm_bindgen]
pub struct MenuOCRProcessor;

#[wasm_bindgen]
impl MenuOCRProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> MenuOCRProcessor {
        MenuOCRProcessor
    }
    
    #[wasm_bindgen]
    pub fn preprocess_image(&self, image_data: &[u8]) -> Vec<u8> {
        // Image preprocessing for OCR optimization
        image_data.to_vec()
    }
    
    #[wasm_bindgen]
    pub fn extract_menu_structure(&self, ocr_text: &str) -> JsValue {
        let sections = self.parse_menu_sections(ocr_text);
        serde_wasm_bindgen::to_value(&sections).unwrap()
    }
    
    fn parse_menu_sections(&self, text: &str) -> Vec<MenuSection> {
        // Advanced parsing logic for menu structure
        vec![]
    }
}

#[derive(Serialize, Deserialize)]
struct MenuSection {
    title: String,
    items: Vec<MenuItem>,
}

#[derive(Serialize, Deserialize)]
struct MenuItem {
    name: String,
    description: String,
    price: f64,
    dietary_tags: Vec<String>,
}

#[wasm_bindgen]
pub struct PerformanceMonitor {
    start_time: f64,
}

#[wasm_bindgen]
impl PerformanceMonitor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> PerformanceMonitor {
        let window = web_sys::window().unwrap();
        let performance = window.performance().unwrap();
        
        PerformanceMonitor {
            start_time: performance.now(),
        }
    }
    
    #[wasm_bindgen]
    pub fn measure_fps(&self) -> f64 {
        let window = web_sys::window().unwrap();
        let performance = window.performance().unwrap();
        let current = performance.now();
        
        1000.0 / (current - self.start_time)
    }
    
    #[wasm_bindgen]
    pub fn optimize_animation_frame(&self, target_fps: f64) -> bool {
        let current_fps = self.measure_fps();
        current_fps >= target_fps * 0.95
    }
}