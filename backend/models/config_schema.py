"""
Pydantic models that mirror Docling's PdfPipelineOptions and all nested
configuration classes. These models are used to:
  1. Validate incoming config from the frontend.
  2. Construct the live DocumentConverter with the exact options.
  3. Serialize the active config to YAML for reproducibility.

References:
  https://docling-project.github.io/docling/reference/pipeline_options/
  https://docling-project.github.io/docling/reference/document_converter/
"""

from __future__ import annotations

from enum import Enum
from pathlib import Path
from typing import List, Optional, Union

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums (mirrors Docling's internal enums)
# ---------------------------------------------------------------------------

class OcrEngine(str, Enum):
    """Supported OCR backend engines."""
    EASYOCR = "easyocr"
    RAPIDOCR = "rapidocr"
    TESSERACT = "tesseract"
    TESSERACT_CLI = "tesseract_cli"
    OCRMYPDF = "ocrmypdf"


class TableStructureMode(str, Enum):
    """Controls the accuracy/speed trade-off of the table structure parser."""
    FAST = "fast"
    ACCURATE = "accurate"


class AcceleratorDevice(str, Enum):
    """Hardware accelerator to use for model inference."""
    AUTO = "auto"  # Let docling pick the best device per model (recommended for Apple Silicon)
    CPU = "cpu"
    CUDA = "cuda"
    MPS = "mps"   # Apple Silicon Metal Performance Shaders
    XPU = "xpu"   # Intel XPU


class OutputFormat(str, Enum):
    """Available output serialization formats."""
    MARKDOWN = "markdown"
    JSON = "json"
    DOCTAGS = "doctags"
    TEXT = "text"
    HTML = "html"


class PictureDescriptionKind(str, Enum):
    """Vision-language model backend for picture descriptions."""
    GRANITE_VISION = "granite_vision"
    API = "api"
    DISABLED = "disabled"


class PictureClassificationKind(str, Enum):
    """Model backend for picture classification."""
    DOCLING = "docling"
    DISABLED = "disabled"


class CodeFormulaKind(str, Enum):
    """Model backend for code/formula enrichment."""
    GRANITE = "granite"
    DISABLED = "disabled"


class ChartExtractionKind(str, Enum):
    """Model backend for chart data extraction."""
    DOCLING = "docling"
    DISABLED = "disabled"


# ---------------------------------------------------------------------------
# Nested option models
# ---------------------------------------------------------------------------

class OcrOptions(BaseModel):
    """
    Configuration for the Optical Character Recognition engine.
    Docling supports multiple OCR backends; choose the one that best balances
    speed vs. accuracy for your content.
    """

    kind: OcrEngine = Field(
        default=OcrEngine.EASYOCR,
        description=(
            "The OCR backend engine. easyocr is GPU-accelerated and handles 80+ "
            "languages. rapidocr is CPU-friendly and very fast. tesseract is the "
            "classic open-source engine. ocrmypdf provides searchable PDF output."
        ),
    )

    lang: List[str] = Field(
        default=["en"],
        description=(
            "List of language codes for OCR recognition (e.g. ['en', 'de', 'fr']). "
            "Adding more languages increases accuracy for multilingual documents but "
            "also increases memory usage and inference time."
        ),
    )

    force_full_page_ocr: bool = Field(
        default=False,
        description=(
            "When True, forces OCR on the entire page even if the page has native "
            "text (e.g., a scanned PDF with an embedded text layer). Useful when "
            "the native text layer is garbled or misaligned."
        ),
    )

    bitmap_area_threshold: float = Field(
        default=0.05,
        ge=0.0,
        le=1.0,
        description=(
            "Minimum fraction of a page that must be covered by bitmap (image) "
            "content before OCR is triggered on that page. A value of 0.05 means "
            "OCR runs if >5%% of the page is image-based. Lower values = more OCR."
        ),
    )


class TableStructureOptions(BaseModel):
    """
    Controls how Docling's table detection and structure recognition works.
    Table parsing is one of the most computationally expensive operations.
    """

    mode: TableStructureMode = Field(
        default=TableStructureMode.FAST,
        description=(
            "'fast' uses a lightweight model optimised for speed. "
            "'accurate' uses TableTransformer for higher fidelity on complex tables "
            "with merged cells and multi-level headers, at 2-4× higher latency."
        ),
    )

    do_cell_matching: bool = Field(
        default=True,
        description=(
            "When True, Docling matches detected table cells back to the PDF's "
            "native text, improving text quality in table cells. Disable if you "
            "see duplicate or misaligned cell content."
        ),
    )


class AcceleratorOptions(BaseModel):
    """
    Hardware and threading configuration for model inference.
    Docling uses PyTorch models; these settings control device placement.
    """

    device: AcceleratorDevice = Field(
        default=AcceleratorDevice.CPU,
        description=(
            "Inference device. 'cpu' works everywhere. 'cuda' requires an NVIDIA "
            "GPU with CUDA drivers. 'mps' is for Apple Silicon (M1/M2/M3/M4). "
            "GPU inference is 5-20× faster for OCR and table structure models."
        ),
    )

    num_threads: int = Field(
        default=4,
        ge=1,
        le=64,
        description=(
            "Number of CPU threads for PyTorch operations. Effective only on CPU "
            "device. Higher values can speed up inference on multi-core machines "
            "up to a saturation point (usually 8-16 threads)."
        ),
    )


class LayoutOptions(BaseModel):
    """
    Options controlling the page layout analysis model behaviour.
    """

    keep_images: bool = Field(
        default=True,
        description=(
            "When True, detected image regions are preserved in the output document. "
            "Disable to strip all images from the parsed output, reducing output size."
        ),
    )

    use_legacy_layout: bool = Field(
        default=False,
        description=(
            "Falls back to the older rule-based layout heuristics instead of the "
            "AI model. Only enable for simple, well-structured documents where the "
            "neural model produces incorrect results."
        ),
    )


class HeadingHierarchyOptions(BaseModel):
    """
    Controls how detected headings are organised into a hierarchy tree.
    """

    hierarchy_expansion_depth: int = Field(
        default=3,
        ge=1,
        le=6,
        description=(
            "Maximum heading nesting depth to infer from font size / style signals. "
            "A depth of 3 means H1→H2→H3 levels are constructed. Increasing depth "
            "produces finer-grained document structure but may over-segment documents "
            "with inconsistent formatting."
        ),
    )


class PictureDescriptionOptions(BaseModel):
    """
    Configuration for the vision-language model that generates natural language
    descriptions of detected figures and pictures.
    """

    kind: PictureDescriptionKind = Field(
        default=PictureDescriptionKind.DISABLED,
        description=(
            "The VLM backend used for picture captioning. 'granite_vision' uses "
            "IBM Granite Vision locally. 'api' calls a remote VLM endpoint. "
            "'disabled' skips picture description entirely."
        ),
    )

    prompt: str = Field(
        default="Describe the image in detail, including any text, charts, or diagrams visible.",
        description=(
            "The prompt sent to the VLM for each detected picture. Customise to "
            "extract domain-specific information (e.g., 'Identify all chemical "
            "structures and their labels.')."
        ),
    )


class PictureClassificationOptions(BaseModel):
    """
    Configuration for the picture classification model that labels
    detected images (e.g., photograph, chart, diagram, logo).
    """

    kind: PictureClassificationKind = Field(
        default=PictureClassificationKind.DISABLED,
        description=(
            "'docling' uses the built-in classification model. 'disabled' skips "
            "classification. Enabling adds picture type metadata to every image "
            "element in the parsed document."
        ),
    )


class CodeFormulaOptions(BaseModel):
    """
    Configuration for code block and mathematical formula enrichment.
    Enables recognition of LaTeX, code snippets, and inline math.
    """

    kind: CodeFormulaKind = Field(
        default=CodeFormulaKind.DISABLED,
        description=(
            "'granite' uses IBM Granite for code/formula understanding. "
            "'disabled' treats code blocks as plain text. Enable to get properly "
            "formatted LaTeX or highlighted code in the output."
        ),
    )


class ChartExtractionOptions(BaseModel):
    """
    Configuration for automated chart/graph data extraction.
    When enabled, Docling attempts to extract underlying data from bar charts,
    line graphs, and pie charts into structured tables.
    """

    kind: ChartExtractionKind = Field(
        default=ChartExtractionKind.DISABLED,
        description=(
            "'docling' enables chart-to-data extraction using a specialised model. "
            "'disabled' treats charts as plain images. Enabling can significantly "
            "increase processing time for chart-heavy documents."
        ),
    )


# ---------------------------------------------------------------------------
# Top-level PdfPipelineOptions model
# ---------------------------------------------------------------------------

class PdfPipelineOptions(BaseModel):
    """
    Complete mirror of Docling's PdfPipelineOptions class.
    Every field here is directly passed to the DocumentConverter at runtime.

    Reference: https://docling-project.github.io/docling/reference/pipeline_options/
    """

    # --- Core toggles ---

    do_ocr: bool = Field(
        default=True,
        description=(
            "Enable Optical Character Recognition. When True, Docling runs the "
            "selected OCR engine on pages identified as scanned/image-based. "
            "Disable to trust native PDF text extraction only (much faster)."
        ),
    )

    do_table_structure: bool = Field(
        default=True,
        description=(
            "Enable AI-powered table detection and structure parsing. When True, "
            "Docling uses TableTransformer/TATR to identify cell boundaries, "
            "spanning cells, and column headers. Disable for speed on text-only docs."
        ),
    )

    do_chart_extraction: bool = Field(
        default=False,
        description=(
            "Enable automated data extraction from charts and graphs. Requires "
            "chart_extraction_options.kind to be set. This is an experimental "
            "feature that adds significant processing time."
        ),
    )

    do_code_enrichment: bool = Field(
        default=False,
        description=(
            "Enable enrichment of detected code blocks. When True, Docling applies "
            "a language model to identify the programming language and produce "
            "structured code elements instead of plain text."
        ),
    )

    do_formula_enrichment: bool = Field(
        default=False,
        description=(
            "Enable LaTeX formula recognition. When True, mathematical expressions "
            "detected in the document are converted to LaTeX markup. Requires a "
            "formula recognition model and adds processing time."
        ),
    )

    do_picture_classification: bool = Field(
        default=False,
        description=(
            "Classify detected pictures into categories (chart, photograph, diagram, "
            "logo, etc.). The classification label is stored in each picture element's "
            "metadata. Useful for downstream routing of image content."
        ),
    )

    do_picture_description: bool = Field(
        default=False,
        description=(
            "Generate natural language captions for detected pictures using a "
            "vision-language model. Captions are stored as annotations on each "
            "picture element. Requires picture_description_options to be configured."
        ),
    )

    force_backend_text: bool = Field(
        default=False,
        description=(
            "Force Docling to use the PDF backend's native text extraction, "
            "bypassing the layout model entirely. This is the fastest possible "
            "mode but loses layout intelligence (reading order, heading detection, etc.)."
        ),
    )

    enable_remote_services: bool = Field(
        default=False,
        description=(
            "Allow Docling to call remote API services for enrichment tasks "
            "(e.g., a remote VLM for picture descriptions). When False, all "
            "processing is strictly local. Keep False for air-gapped environments."
        ),
    )

    allow_external_plugins: bool = Field(
        default=False,
        description=(
            "Allow loading of external/third-party Docling plugins from the "
            "Python environment. Disable in production to avoid unexpected "
            "behaviour from untrusted plugin code."
        ),
    )

    document_timeout: Optional[float] = Field(
        default=None,
        ge=0.0,
        description=(
            "Maximum wall-clock seconds allowed for processing a single document. "
            "If exceeded, the conversion is aborted and an error is returned. "
            "Set to null for no timeout (default)."
        ),
    )

    artifacts_path: Optional[str] = Field(
        default=None,
        description=(
            "Local filesystem path where Docling model weights are stored. "
            "Normally Docling downloads models automatically on first use. "
            "Set this for offline/air-gapped environments pointing to a pre-downloaded "
            "model cache directory."
        ),
    )

    # --- Image generation ---

    generate_page_images: bool = Field(
        default=False,
        description=(
            "Render each PDF page as a raster image and embed it in the output "
            "document. Required if you need page-level screenshots in the output "
            "(e.g., for ColPali multimodal retrieval). Significantly increases "
            "output file size and memory usage."
        ),
    )

    generate_picture_images: bool = Field(
        default=False,
        description=(
            "Crop and extract each detected figure/picture as a standalone image "
            "embedded in the output document. Enables downstream vision pipelines "
            "to process individual images without re-rendering the full page."
        ),
    )

    generate_table_images: bool = Field(
        default=False,
        description=(
            "Render each detected table as a standalone image in the output. "
            "Useful as a fallback when table cell text extraction is unreliable, "
            "or for visual comparison of parsed vs. original table appearance."
        ),
    )

    images_scale: float = Field(
        default=1.0,
        ge=0.25,
        le=4.0,
        description=(
            "DPI scale factor applied when rendering page/picture/table images. "
            "1.0 = 72 DPI (screen quality). 2.0 = 144 DPI (retina quality). "
            "4.0 = 288 DPI (print quality). Higher values → larger files + more RAM."
        ),
    )

    generate_parsed_pages: bool = Field(
        default=False,
        description=(
            "Include a parsed-page representation in the output document, containing "
            "the raw layout detection results (bounding boxes, labels) before "
            "post-processing. Useful for debugging layout model predictions."
        ),
    )

    # --- Batch sizes (performance tuning) ---

    layout_batch_size: int = Field(
        default=4,
        ge=1,
        le=64,
        description=(
            "Number of pages processed simultaneously by the layout analysis model. "
            "Increasing this can improve GPU utilisation but increases VRAM "
            "requirements. Reduce if you encounter out-of-memory errors."
        ),
    )

    ocr_batch_size: int = Field(
        default=4,
        ge=1,
        le=64,
        description=(
            "Number of page crops processed simultaneously by the OCR engine. "
            "Higher values improve throughput on GPU at the cost of more VRAM. "
            "Reduce on CPU-only systems with limited memory."
        ),
    )

    table_batch_size: int = Field(
        default=4,
        ge=1,
        le=64,
        description=(
            "Number of table regions processed simultaneously by the table "
            "structure model. Tune this like layout_batch_size based on your "
            "available GPU memory."
        ),
    )

    # --- Queue / async pipeline tuning ---

    queue_max_size: int = Field(
        default=128,
        ge=1,
        description=(
            "Maximum number of page items that can be queued between pipeline "
            "stages. Larger values allow more buffering between model stages at "
            "the cost of higher memory usage during processing."
        ),
    )

    batch_polling_interval_seconds: float = Field(
        default=0.5,
        ge=0.01,
        description=(
            "How often (in seconds) the pipeline polls each stage for completed "
            "batches. Lower values reduce latency between pipeline stages but "
            "increase CPU overhead from polling. Usually leave at default."
        ),
    )

    stage_shutdown_timeout_seconds: float = Field(
        default=5.0,
        ge=0.5,
        description=(
            "Maximum seconds to wait for a pipeline stage to flush its queue "
            "and shut down cleanly after processing is complete. Increase if you "
            "see incomplete output on very large documents."
        ),
    )

    # --- Nested option groups ---

    ocr_options: OcrOptions = Field(
        default_factory=OcrOptions,
        description="Detailed configuration for the OCR engine and its parameters.",
    )

    table_structure_options: TableStructureOptions = Field(
        default_factory=TableStructureOptions,
        description="Detailed configuration for the table structure recognition model.",
    )

    layout_options: LayoutOptions = Field(
        default_factory=LayoutOptions,
        description="Options controlling the page layout analysis model.",
    )

    heading_hierarchy_options: HeadingHierarchyOptions = Field(
        default_factory=HeadingHierarchyOptions,
        description="Options for constructing the heading hierarchy from detected headings.",
    )

    accelerator_options: AcceleratorOptions = Field(
        default_factory=AcceleratorOptions,
        description="Hardware device and threading options for model inference.",
    )

    picture_description_options: PictureDescriptionOptions = Field(
        default_factory=PictureDescriptionOptions,
        description="Configuration for the vision-language model used for picture captioning.",
    )

    picture_classification_options: PictureClassificationOptions = Field(
        default_factory=PictureClassificationOptions,
        description="Configuration for the picture classification model.",
    )

    code_formula_options: CodeFormulaOptions = Field(
        default_factory=CodeFormulaOptions,
        description="Configuration for code block and formula enrichment.",
    )

    chart_extraction_options: ChartExtractionOptions = Field(
        default_factory=ChartExtractionOptions,
        description="Configuration for automated chart data extraction.",
    )


# ---------------------------------------------------------------------------
# Top-level config file schema (wraps PdfPipelineOptions + output settings)
# ---------------------------------------------------------------------------

class OutputSettings(BaseModel):
    """Output format and routing settings (not part of PdfPipelineOptions itself)."""

    formats: List[OutputFormat] = Field(
        default=[OutputFormat.HTML, OutputFormat.MARKDOWN, OutputFormat.JSON],
        description=(
            "List of output formats to generate for each run. 'html' produces an "
            "annotated page-view HTML. 'markdown' produces human-readable .md. "
            "'json' produces the full DoclingDocument as JSON. "
            "'doctags' produces the DocTags token format. 'text' produces plain text."
        ),
    )

    html_split_page_view: bool = Field(
        default=True,
        description=(
            "When generating HTML output, render each page in its own section "
            "with the page image as background. Requires generate_page_images=true "
            "in pdf_options for annotations to appear on the page image."
        ),
    )

    html_include_annotations: bool = Field(
        default=True,
        description=(
            "When generating HTML output, overlay bounding-box annotations for "
            "every detected element (text blocks, tables, figures, etc.) on the "
            "page image. Visualises exactly what Docling extracted and where."
        ),
    )


class PipelineConfig(BaseModel):
    """
    The root configuration schema stored in YAML files under /configs/.
    Each profile is one instance of this model.
    """

    profile_name: str = Field(
        default="default",
        description="Human-readable name for this configuration profile.",
    )

    description: str = Field(
        default="Default Docling pipeline configuration",
        description="Optional description of what this profile is tuned for.",
    )

    pdf_options: PdfPipelineOptions = Field(
        default_factory=PdfPipelineOptions,
        description="Complete Docling PDF pipeline options.",
    )

    output: OutputSettings = Field(
        default_factory=OutputSettings,
        description="Output format and routing settings.",
    )
