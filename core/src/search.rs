use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[wasm_bindgen]
pub struct FuzzySearchEngine {
    index: SearchIndex,
}

#[derive(Default)]
struct SearchIndex {
    cocktails: Vec<SearchItem>,
    wines: Vec<SearchItem>,
    menu_items: Vec<SearchItem>,
    ingredients: HashMap<String, Vec<usize>>,
}

#[derive(Clone, Serialize, Deserialize)]
struct SearchItem {
    id: String,
    name: String,
    category: String,
    keywords: Vec<String>,
    description: String,
    spirit: Option<String>,
    ingredients: Vec<String>,
    price: Option<f64>,
}

#[wasm_bindgen]
impl FuzzySearchEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> FuzzySearchEngine {
        FuzzySearchEngine {
            index: SearchIndex::default(),
        }
    }

    #[wasm_bindgen]
    pub fn index_cocktails(&mut self, data: JsValue) {
        if let Ok(cocktails) = serde_wasm_bindgen::from_value::<Vec<SearchItem>>(data) {
            self.index.cocktails = cocktails;
            self.build_ingredient_index();
        }
    }

    #[wasm_bindgen]
    pub fn search(&self, query: &str, limit: usize) -> JsValue {
        let query = query.to_lowercase();
        let tokens: Vec<&str> = query.split_whitespace().collect();
        
        let mut results = Vec::new();
        
        // Search cocktails
        for item in &self.index.cocktails {
            let score = self.calculate_relevance(&item, &tokens);
            if score > 0.0 {
                results.push((item.clone(), score));
            }
        }
        
        // Sort by relevance
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        results.truncate(limit);
        
        let items: Vec<SearchItem> = results.into_iter().map(|(item, _)| item).collect();
        serde_wasm_bindgen::to_value(&items).unwrap()
    }

    #[wasm_bindgen]
    pub fn search_by_ingredient(&self, ingredient: &str) -> JsValue {
        let ingredient = ingredient.to_lowercase();
        let mut results = Vec::new();
        
        if let Some(indices) = self.index.ingredients.get(&ingredient) {
            for &idx in indices {
                if idx < self.index.cocktails.len() {
                    results.push(self.index.cocktails[idx].clone());
                }
            }
        }
        
        serde_wasm_bindgen::to_value(&results).unwrap()
    }

    fn calculate_relevance(&self, item: &SearchItem, tokens: &[&str]) -> f64 {
        let mut score = 0.0;
        
        for token in tokens {
            // Exact name match (highest weight)
            if item.name.to_lowercase().contains(token) {
                score += 10.0;
            }
            
            // Spirit match
            if let Some(spirit) = &item.spirit {
                if spirit.to_lowercase().contains(token) {
                    score += 7.0;
                }
            }
            
            // Ingredient match
            for ingredient in &item.ingredients {
                if ingredient.to_lowercase().contains(token) {
                    score += 5.0;
                }
            }
            
            // Description match
            if item.description.to_lowercase().contains(token) {
                score += 2.0;
            }
            
            // Keyword match
            for keyword in &item.keywords {
                if keyword.to_lowercase().contains(token) {
                    score += 3.0;
                }
            }
        }
        
        // Apply fuzzy matching bonus
        score *= self.fuzzy_match_multiplier(&item.name, &tokens.join(" "));
        
        score
    }

    fn fuzzy_match_multiplier(&self, text: &str, query: &str) -> f64 {
        let text = text.to_lowercase();
        let query = query.to_lowercase();
        
        // Levenshtein distance approximation
        let max_len = text.len().max(query.len()) as f64;
        let common_chars = text.chars()
            .filter(|c| query.contains(*c))
            .count() as f64;
        
        (common_chars / max_len).max(0.5)
    }

    fn build_ingredient_index(&mut self) {
        self.index.ingredients.clear();
        
        for (idx, cocktail) in self.index.cocktails.iter().enumerate() {
            for ingredient in &cocktail.ingredients {
                let key = ingredient.to_lowercase();
                self.index.ingredients
                    .entry(key)
                    .or_insert_with(Vec::new)
                    .push(idx);
            }
        }
    }
}