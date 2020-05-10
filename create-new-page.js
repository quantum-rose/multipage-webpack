const { resolve } = require('path');
const { existsSync, mkdirSync, writeFile } = require('fs');
const { Command } = require('commander');
const program = new Command();
program.option('-p, --page-name <type>', 'The page name', 'template');
program.parse(process.argv);
const outPath = resolve('./src/pages', program.pageName);
if (!existsSync(outPath)) {
    mkdirSync(outPath);
}
const page = {
    ejs: `
<!DOCTYPE html>
<html lang="en">
    <head>
        <%= require('@components/meta.ejs')() %>
        <title>${program.pageName}</title>
        <% if(IS_DEV) { %>
        <link rel="stylesheet" href="<%= BASE_URL + 'libs/bootstrap/css/bootstrap.css' %>" />
        <% } else { %>
        <link rel="stylesheet" href="<%= BASE_URL + 'libs/bootstrap/css/bootstrap.min.css' %>" />
        <% } %>
    </head>
    <body>
        <footer>
            <%= require('@components/copyright.ejs')() %>
        </footer>
        
        <% if(IS_DEV) { %>
        <script src="<%= BASE_URL + 'libs/jquery/jquery-3.5.1.js' %>"></script>
        <script src="<%= BASE_URL + 'libs/bootstrap/js/bootstrap.bundle.js' %>"></script>
        <script src="https://cdn.staticfile.org/vConsole/3.3.4/vconsole.min.js"></script>
        <script>new VConsole();</script>
        <% } else { %>
        <script src="<%= BASE_URL + 'libs/jquery/jquery-3.5.1.min.js' %>"></script>
        <script src="<%= BASE_URL + 'libs/bootstrap/js/bootstrap.bundle.min.js' %>"></script>
        <% } %>
    </body>
</html>
`,
    js: `
import './${program.pageName}.scss';
`,
    scss: `
@import '@utils/common.scss';
    `,
};
for (let key in page) {
    const filename = program.pageName + '.' + key;
    writeFile(resolve(outPath, filename), page[key].trim(), (err) => {
        if (err) throw err;
        console.log(filename + ' 创建成功');
    });
}
