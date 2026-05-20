import json
import logging
import pathlib
import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

_model = SentenceTransformer("jhgan/ko-sroberta-multitask")

_CAT_LABEL_PATH = pathlib.Path(__file__).parent / "cat_label.json"
_cat_label_data = json.loads(_CAT_LABEL_PATH.read_text(encoding="utf-8"))
CAT_LABEL: dict[str, str] = {k: v for group in _cat_label_data.values() for k, v in group.items()}


def get_embedding(text: str) -> list[float]:
    try:
        return _model.encode(text).tolist()
    except Exception as e:
        logger.error(f"[임베딩] 생성 실패 - {e}")
        return []


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


def embedding_to_json(vector: list[float]) -> str:
    return json.dumps(vector)


def json_to_embedding(text: str) -> list[float]:
    return json.loads(text) if text else []
