package __PACKAGE_NAME__;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ReceiptPrinter")
public class ReceiptPrinterPlugin extends Plugin {

    @PluginMethod
    public void printReceipt(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                PrintManager printManager = (PrintManager) getContext()
                        .getSystemService(Context.PRINT_SERVICE);
                WebView webView = getBridge().getWebView();

                if (printManager == null || webView == null) {
                    call.reject("Layanan cetak Android tidak tersedia.");
                    return;
                }

                String jobName = call.getString("jobName", "Struk Kasir Alfamidi");
                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(jobName);
                printManager.print(jobName, adapter, new PrintAttributes.Builder().build());
                call.resolve();
            } catch (Exception error) {
                call.reject("Gagal membuka dialog cetak Android.", error);
            }
        });
    }
}
