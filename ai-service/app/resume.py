import io
import pypdf

try:
    import pymupdf
except ImportError:
    pymupdf = None


def extract_pdf_text(pdf_bytes: bytes) -> str:
    if not pdf_bytes:
        raise ValueError("The uploaded PDF is empty")

    text = ""

    # Primary extraction using pypdf
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                pages_text.append(extracted)
        text = "\n".join(pages_text).strip()
    except Exception:
        text = ""

    # Fallback to pymupdf if pypdf found no selectable text
    if not text and pymupdf is not None:
        try:
            document = pymupdf.open(stream=pdf_bytes, filetype="pdf")
            try:
                text = "\n".join(page.get_text() for page in document).strip()
            finally:
                document.close()
        except Exception:
            pass

    if not text:
        raise ValueError(
            "No selectable text was found. This PDF may be scanned."
        )

    if len(text) > 100_000:
        text = text[:100_000]

    return text