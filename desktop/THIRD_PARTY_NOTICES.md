# Native inference components

Jyotish uses llama.cpp build b11609 (MIT), from the official ggml-org GitHub release. See llama-LICENSE.txt. Model weights are downloaded separately into each user's local model cache; they are not part of the app archive.

Native conversation uses Qwen3.5 9B, licensed Apache-2.0 by the Qwen team. The GGUF Q4_K_M conversion is provided by Unsloth, pinned to revision 3885219b6810b007914f3a7950a8d1b469d598a5. Its SHA-256 is 03b74727a860a56338e042c4420bb3f04b2fec5734175f4cb9fa853daf52b7e8. Source: https://huggingface.co/Qwen/Qwen3.5-9B and https://huggingface.co/unsloth/Qwen3.5-9B-GGUF.

The web renderer retains its bundled library notices. The Python runtime and report libraries retain their included licenses. Classical texts are cited through brief selected summaries and links; whole copyrighted study books are not bundled.
