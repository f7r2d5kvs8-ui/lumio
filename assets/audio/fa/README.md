# Persian audio

These files are generated offline with Piper's `fa_IR-amir-medium` voice. Lumio
packages the generated WAV files so Persian speech does not depend on voices
installed on the child's phone or browser.

- Voice repository: `rhasspy/piper-voices` (MIT)
- Voice: `fa_IR-amir-medium`
- Model card dataset license: CC0
- Runtime used for generation: Piper

The Piper runtime and 63 MB model are intentionally not stored in the app. To
regenerate the files, download the Windows Piper runtime and the Amir ONNX model
to `%TEMP%\lumio-piper`, then run `tools/generate-persian-audio.py`.
