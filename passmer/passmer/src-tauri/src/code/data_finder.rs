use rayon::prelude::*; // Für parallele Verarbeitung

pub fn sort_by_search_with_strings(search_data: &str, data_collection: &mut Vec<String>) {
    let search_data_bytes = search_data.to_lowercase().as_bytes().to_vec();
    let mut data_collection_bytes: Vec<Vec<u8>> = data_collection
        .iter()
        .map(|data| data.to_lowercase().into_bytes())
        .collect();

    sort_by_search(&search_data_bytes, &mut data_collection_bytes);

    *data_collection = data_collection_bytes
        .into_iter()
        .map(|data| String::from_utf8(data).unwrap())
        .collect();
}

pub fn sort_by_search(search_data: &[u8], data_collection: &mut Vec<Vec<u8>>) {
    let mut data_with_scores: Vec<Data> = data_collection
        .par_iter()
        .map(|data| {
            let score = calculate_similarity(search_data, data);
            Data::new(data.clone(), score)
        })
        .collect();

    data_with_scores.par_sort_unstable_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

    *data_collection = data_with_scores.into_iter().map(|data| data.data).collect();
}

struct Data {
    data: Vec<u8>,
    score: f64,
}

impl Data {
    fn new(data: Vec<u8>, score: f64) -> Self {
        Data { data, score }
    }
}

fn calculate_similarity(a: &[u8], b: &[u8]) -> f64 {
    let max_length = a.len().max(b.len()) as f64;
    let length_diff = (a.len() as isize - b.len() as isize).abs() as f64;
    let mut score = 100.0;

    score -= (length_diff / max_length) * 100.0;

    let min_length = a.len().min(b.len());
    let mismatch_penalty = 100.0 / max_length;

    for i in 0..min_length {
        if a[i] != b[i] {
            score -= mismatch_penalty * 2.0;
        }
    }

    if b.len() > a.len() {
        score -= mismatch_penalty * (b.len() as f64 - a.len() as f64) * 2.0;
    }

    score
}
