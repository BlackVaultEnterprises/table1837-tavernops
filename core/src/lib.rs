use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use web_sys::Performance;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// Initialize panic hook for better error messages in WASM
#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

/// Glassmorphic renderer for high-performance UI calculations
#[wasm_bindgen]
pub struct GlassmorphicRenderer {
    performance: Performance,
}

#[wasm_bindgen]
impl GlassmorphicRenderer {
    /// Creates a new GlassmorphicRenderer instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<GlassmorphicRenderer, JsValue> {
        init_panic_hook();
        
        let window = web_sys::window()
            .ok_or_else(|| JsValue::from_str("No window object found"))?;
        let performance = window.performance()
            .ok_or_else(|| JsValue::from_str("Performance API not available"))?;
        
        Ok(GlassmorphicRenderer { performance })
    }
    
    /// Calculates blur intensity based on scroll position
    /// Returns a value between 3.0 and 8.0
    #[wasm_bindgen]
    pub fn calculate_blur_intensity(&self, scroll_position: f64, viewport_height: f64) -> f64 {
        if viewport_height <= 0.0 {
            return 3.0;
        }
        let normalized = (scroll_position / viewport_height).min(1.0).max(0.0);
        3.0 + (normalized * 5.0)
    }
    
    /// Calculates parallax offset for layered backgrounds
    #[wasm_bindgen]
    pub fn calculate_parallax_offset(&self, scroll_position: f64, layer_depth: f64) -> f64 {
        let depth_factor = layer_depth.clamp(0.0, 1.0);
        scroll_position * (0.5 - (depth_factor * 0.1))
    }
    
    /// Optimizes card transform for magnetic hover effects
    #[wasm_bindgen]
    pub fn optimize_card_transform(&self, mouse_x: f64, mouse_y: f64, intensity: f64) -> TransformData {
        let clamped_intensity = intensity.clamp(0.0, 2.0);
        let rotate_x = (mouse_y * clamped_intensity).clamp(-15.0, 15.0);
        let rotate_y = (mouse_x * clamped_intensity).clamp(-15.0, 15.0);
        let scale = 1.0 + (clamped_intensity * 0.02);
        
        TransformData {
            rotate_x,
            rotate_y,
            scale,
            perspective: 1000.0,
        }
    }
}

/// Transform data for card animations
#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct TransformData {
    pub rotate_x: f64,
    pub rotate_y: f64,
    pub scale: f64,
    pub perspective: f64,
}

/// OCR processor for menu digitization
#[wasm_bindgen]
pub struct MenuOCRProcessor;

#[wasm_bindgen]
impl MenuOCRProcessor {
    /// Creates a new MenuOCRProcessor instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> MenuOCRProcessor {
        MenuOCRProcessor
    }
    
    /// Preprocesses image data for optimal OCR results
    #[wasm_bindgen]
    pub fn preprocess_image(&self, image_data: &[u8]) -> Vec<u8> {
        // TODO: Implement image preprocessing
        // For now, return a copy of the input
        image_data.to_vec()
    }
    
    /// Extracts menu structure from OCR text
    #[wasm_bindgen(catch)]
    pub fn extract_menu_structure(&self, ocr_text: &str) -> Result<JsValue, JsValue> {
        let sections = self.parse_menu_sections(ocr_text);
        serde_wasm_bindgen::to_value(&sections)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }
    
    fn parse_menu_sections(&self, text: &str) -> Vec<MenuSection> {
        // TODO: Implement advanced menu parsing logic
        // This is a placeholder implementation
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

/// Performance monitor for tracking frame rates and optimization
#[wasm_bindgen]
pub struct PerformanceMonitor {
    start_time: f64,
    performance: Option<Performance>,
}

#[wasm_bindgen]
impl PerformanceMonitor {
    /// Creates a new PerformanceMonitor instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> PerformanceMonitor {
        let (performance, start_time) = web_sys::window()
            .and_then(|w| w.performance())
            .map(|p| {
                let time = p.now();
                (Some(p), time)
            })
            .unwrap_or((None, 0.0));
        
        PerformanceMonitor {
            start_time,
            performance,
        }
    }
    
    /// Measures current frames per second
    #[wasm_bindgen]
    pub fn measure_fps(&self) -> f64 {
        match &self.performance {
            Some(perf) => {
                let current = perf.now();
                let delta = current - self.start_time;
                if delta > 0.0 {
                    1000.0 / delta
                } else {
                    60.0 // Default to 60 FPS
                }
            }
            None => 60.0 // Default when Performance API unavailable
        }
    }
    
    /// Checks if animation frame rate is acceptable
    #[wasm_bindgen]
    pub fn optimize_animation_frame(&self, target_fps: f64) -> bool {
        let current_fps = self.measure_fps();
        current_fps >= target_fps * 0.95
    }
}