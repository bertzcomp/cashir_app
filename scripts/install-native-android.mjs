import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'capacitor.config.json'), 'utf8'));
const packageName = config.appId;

if (!/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(packageName)) {
  throw new Error(`capacitor.config.json contains an invalid appId: ${packageName}`);
}

const androidRoot = path.join(root, 'android');
await access(path.join(androidRoot, 'app', 'src', 'main'));

const javaDirectory = path.join(
  androidRoot,
  'app',
  'src',
  'main',
  'java',
  ...packageName.split('.')
);
await mkdir(javaDirectory, { recursive: true });

const pluginTemplate = await readFile(
  path.join(root, 'native', 'android', 'ReceiptPrinterPlugin.java'),
  'utf8'
);
await writeFile(
  path.join(javaDirectory, 'ReceiptPrinterPlugin.java'),
  pluginTemplate.replaceAll('__PACKAGE_NAME__', packageName)
);

const mainActivity = `package ${packageName};

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ReceiptPrinterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
`;
await writeFile(path.join(javaDirectory, 'MainActivity.java'), mainActivity);

console.log(`Installed ReceiptPrinter Android bridge for ${packageName}.`);
