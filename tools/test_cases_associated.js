const fs = require('fs');
const { resolve } = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { program } = require('commander');
const Handlebars = require('handlebars');
const { isObject, assign } = require('lodash');
const moment = require('moment');


const root = (dir) => resolve(__dirname, `../${dir}`);

const color = {
  passed: '#4caf50',
  failed: '#f44336',
  pending: '#ffac11',
  skipped: '#03a9f4',
  unknown: '#f4eb36',
};

const funcMap = {
  passed: (test, caseName, reportLink) => {
    const deployHtml = `
  <div>
    <a style="color: ${color.passed};" href="${reportLink}#${test.uuid}">PASSED: ${caseName}</a>
  </div>`;
    return new Handlebars.SafeString(deployHtml);
  },

  failed: (test, caseName, reportLink, imageUrl, videoUrl) => {
    const deployHtml = `
  <div>
    <a style="color: ${color.failed};" href="${reportLink}#${test.uuid}">FAILED: ${caseName}</a>
    <img src="${imageUrl}", alt="${imageUrl}"></img>
    <video width="320" height="240" controls>
      <source src="${videoUrl}" type="video/mp4">
    Your browser does not support the video tag.
    </video>
  </div>`;
    return new Handlebars.SafeString(deployHtml);
  },
  pending: (test, caseName, reportLink) => {
    const deployHtml = `
  <div>
    <a style="color: ${color.pending};" href="${reportLink}#${test.uuid}">SKIPPED: ${caseName}</a>
  </div>
      `;
    return new Handlebars.SafeString(deployHtml);
  },
  skipped: (test, caseName, reportLink) => {
    const deployHtml = `
  <div>
    <a style="color: ${color.skipped};" href="${reportLink}#${test.uuid}">PENDING: ${caseName}</a>
  </div>
      `;
    return new Handlebars.SafeString(deployHtml);
  },
  unknown: () => {
    const deployHtml = `
  <div>
    <span style="color: ${color.unknown};">Not implemented: Current test cases are not automated</span>
  </div>`;
    return new Handlebars.SafeString(deployHtml);
  },
};

const contentTag =
  '<div style="width: 70vw; margin: 0vh 3vw 0vh 3vw; overflow:auto;">';

// const testCase = 'cypress/videos';

const errorVideos = {};

class GeneratorReport {
  constructor() {
    this.reportLink = null;
    this.reportJson = null;
    this.caseTemplate = null;
    this.outputFile = null;
    this.screenshotDir = null;
    this.videoDir = null;
    this.reportJsonUrlList = null;
    this.summaryOutputFile = null;

    this.totalTable = 0;
    this.totalByCase = {
      passed: 0,
      failed: 0,
      pending: 0,
      skipped: 0,
      unknown: 0,
    };
    this.totalList = [];
    this.detailList = [];

    this.reportData = {};
    this.caseNames = {};

    this.htmlString = null;

    this.Init();
    this.Main();
  }

  Init() {
    this.InitCommandParams();
    this.InitTemplate();
    this.InitTotalTable();
  }

  Main() {
    this.ParseReportJson();
    this.GenerateResult();
    this.GenerateSummary();
  }

  InitTotalTable() {
    const totalTable = this.htmlString.split('<table>').length - 1;
    this.totalTable = totalTable;
  }

  InitCommandParams() {
    program
      .description('Generate test case documents containing test report data')
      .option(
        '-l, --report-link <url>',
        'Cypress html report link address, default "merge-report.html"',
        'merge-report.html'
      )
      .option(
        '-j, --report-json <path>',
        'Cypress json report file path, default "cypress/report/merge-report.json"',
        'cypress/report/merge-report.json'
      )
      .option(
        '-t --case-template <path>',
        'Test case template file path, default "testcases.html"',
        'testcases.html'
      )
      .option(
        '-o, --output-file <path>',
        'Output test case and result report file path, default "testcases-cases.html"',
        'testcases-cases.html'
      )
      .option(
        '-s, --screenshot-dir <path>',
        'Cypress cases screenshot directory, default "./screenshots", cp "cypress/screenshots" to "screenshots"',
        './screenshots'
      )
      .option(
        '-v, --video-dir <path>',
        'Cypress cases video directory, default "./videos", cp "cypress/videos" to "videos"',
        './videos'
      )
      .option(
        '-rjul, --report-json-url-list <urls>',
        'Cypress json report urls, use the comma to separate the urls, default "", these urls are derived from merge-report.json',
        ''
      )
      .option(
        '-so, --summary-output-file <path>',
        'Output coverage summary file path, default "testcases-e2e-summary.html"',
        'testcases-e2e-summary.html'
      );
    program.parse();

    const options = program.opts();
    const {
      reportLink,
      reportJson,
      caseTemplate,
      outputFile,
      screenshotDir,
      videoDir,
      reportJsonUrlList,
      summaryOutputFile,
    } = options;

    if (
      reportLink &&
      reportJson &&
      caseTemplate &&
      outputFile &&
      screenshotDir &&
      videoDir
    ) {
      this.reportLink = reportLink;
      this.reportJson = reportJson;
      this.caseTemplate = caseTemplate;
      this.outputFile = outputFile;
      this.screenshotDir = screenshotDir;
      this.videoDir = videoDir;
      this.reportJsonUrlList = reportJsonUrlList
        .split(',')
        .filter((it) => it.length);
      this.summaryOutputFile = summaryOutputFile;

      return {
        ...options,
        reportJsonUrlList: reportJsonUrlList
          .split(',')
          .filter((it) => it.length),
      };
    }
    // eslint-disable-next-line no-throw-literal
    throw 'Invalid parameters';
  }

  InitTemplate() {
    const file = fs.readFileSync(this.caseTemplate);

    const $ = cheerio.load(file.toString());
    $('table tbody').each((index, el) => {
      const testResult = $(el).find('tr').eq(0).find('td').eq(1).text();
      $(el).after(
        `<tr class="odd"><td>测试结果</td><td>{{ CheckAuto ${testResult}}}</td></tr>`
      );
    });

    this.htmlString = $.html();
  }

  GetSimpleName(str) {
    const name = str.split('-')[0];
    const index = str.split('-')[1];
    if (/\d+/.test(index)) {
      return name;
    }
    return str;
  }

  GetModules(string, tag) {
    let reg;
    switch (tag) {
      case 'h1':
        reg = /<h1 id="(.*?)">/g;
        break;
      case 'h2':
        reg = /<h2 id="(.*?)">/g;
        break;
      case 'h3':
        reg = /<h3 id="(.*?)">/g;
        break;
      case 'h4':
        reg = /<h4 id="(.*?)">/g;
        break;
      default:
        reg = /<h1 id="(.*?)">/g;
    }
    let result = reg.exec(string);
    const ids = [];
    while (result) {
      ids.push(result[1]);
      result = reg.exec(string);
    }
    return ids;
  }

  GetChildModules(htmlString, fatherModules, fatherIndex, fatherLevel) {
    let tmpHtml = '';
    const hTag = `h${fatherLevel}`;
    if (fatherIndex < fatherModules.length - 1) {
      const firstTag = `<${hTag} id="${fatherModules[fatherIndex]}"`;
      const secondTag = `<${hTag} id="${fatherModules[fatherIndex + 1]}"`;
      // eslint-disable-next-line prefer-destructuring
      tmpHtml = htmlString.split(firstTag)[1].split(secondTag)[0];
    } else {
      const firstTag = `<${hTag} id="${fatherModules[fatherIndex]}"`;
      // eslint-disable-next-line prefer-destructuring
      tmpHtml = htmlString.split(firstTag)[1].split(`<${hTag} id`)[0];
    }
    return this.GetModules(tmpHtml, `h${fatherLevel + 1}`);
  }

  GetModuleCaseCount(htmlString, modules, moduleIndex) {
    let caseCount = 0;
    let tmpString = '';
    const caseIds = [];
    let tmpStringDom = null;
    if (moduleIndex < modules.length - 1) {
      const { second, third } = modules[moduleIndex];
      const { second: nextSecond, third: nextThird } = modules[moduleIndex + 1];
      const tag1 = third ? `<h3 id="${third}">` : `<h2 id="${second}">`;
      const tag2 = nextThird
        ? `<h3 id="${nextThird}">`
        : `<h2 id="${nextSecond}">`;
      // eslint-disable-next-line prefer-destructuring
      tmpString = htmlString.split(tag1)[1].split(tag2)[0];

      const startIndex = htmlString.indexOf(tag1);
      const endIndex = htmlString.indexOf(tag2);
      tmpStringDom = htmlString.substring(startIndex, endIndex);
    } else {
      const { second, third } = modules[moduleIndex];
      const tag = third ? `<h3 id="${third}">` : `<h2 id="${second}">`;
      // eslint-disable-next-line prefer-destructuring
      tmpString = htmlString.split(tag)[1];
      const startIndex = htmlString.indexOf(tag);
      tmpStringDom = htmlString.substring(startIndex);
    }

    if (tmpStringDom) {
      const $ = cheerio.load(tmpStringDom);
      $('table').each((index, el) => {
        caseIds.push($(el).find('tr td').eq(1).text());
      });
    }
    caseCount = tmpString.split('<table').length - 1;

    return {
      caseCount,
      caseIds,
    };
  }

  GetModuleE2ECount(module, names) {
    const base = {
      passed: 0,
      failed: 0,
      skipped: 0,
      pending: 0,
      e2eTotal: 0,
      totalPercent: '0.00%',
    };
    const { caseCount, caseIds } = module;

    caseIds.forEach((item) => {
      if (names[item]) {
        const state = names[item];
        base[state] += 1;
        base.e2eTotal += 1;
      }
    });
    base.totalPercent =
      caseCount > 0
        ? `${((base.e2eTotal / caseCount) * 100).toFixed(2)}%`
        : '0.00%';

    return base;
  }

  GetHtmlAllModules(htmlString, names) {
    const modules = [];
    const firstModules = this.GetModules(htmlString, 'h1');
    firstModules.forEach((first, firstIndex) => {
      const secondModules = this.GetChildModules(
        htmlString,
        firstModules,
        firstIndex,
        1
      );
      secondModules.forEach((second, secondIndex) => {
        const thirdModules = this.GetChildModules(
          htmlString,
          secondModules,
          secondIndex,
          2
        );
        if (thirdModules.length) {
          thirdModules.forEach((third) => {
            modules.push({
              first,
              second,
              third,
            });
          });
        } else {
          modules.push({
            first,
            second,
          });
        }
      });
    });
    modules.forEach((module, moduleIndex) => {
      const { caseCount, caseIds } = this.GetModuleCaseCount(
        htmlString,
        modules,
        moduleIndex
      );
      module.caseCount = caseCount;
      module.caseIds = caseIds;
      const detail = this.GetModuleE2ECount(module, names);
      Object.keys(detail).forEach((it) => {
        module[it] = detail[it];
      });
    });
    return modules;
  }

  UpdateHtmlWithTotal(htmlString, tag, isSummary = false) {
    const contentStr = tag;
    const totalSource =
      '<ul style="font-size: 14px;line-height:2" class="list-group">{{#totalList}}' +
      ' <li class="list-group-item">{{name}}: {{value}}</li>' +
      '{{/totalList}}' +
      '</ul>';
    const totalContent = `<h1 id="汇总">汇总<h1> ${totalSource}`;
    const detailContent =
      '<table style="font-size:14px;line-height:1.5" class="table table-hover table-bordered table-striped">' +
      '<thead class="table-dark"><tr><th style="width: 40%">模块</th><th>用例数</th><th>E2E用例数</th><th>E2E覆盖率</th><th>E2E用例通过</th><th>E2E用例失败</th><th>E2E用例跳过</th></tr></thead>' +
      '<tbody>{{#detailList}}<tr><td>{{name}}</td><td>{{caseCount}}</td><td>{{e2eTotal}}</td><td>{{totalPercent}}</td><td>{{passed}}</td><td>{{failed}}</td><td>{{pending}}</td></tr>{{/detailList}}' +
      '</tbody></table>';

    const navStr = '<ul>';
    const navIndex = htmlString.indexOf(navStr) + navStr.length;
    const totalNavStr = '<li><a href="#汇总">汇总</a></li>';
    let newHtmlString = htmlString;
    if (!isSummary) {
      newHtmlString =
        htmlString.slice(0, navIndex) +
        totalNavStr +
        htmlString.slice(navIndex);
    }
    const contentIndex = newHtmlString.indexOf(contentStr) + contentStr.length;
    newHtmlString =
      newHtmlString.slice(0, contentIndex) +
      totalContent +
      detailContent +
      newHtmlString.slice(contentIndex);

    return newHtmlString;
  }

  UpdateContextWithTotal = () => {
    const { totalTable, totalByCase: totals } = this;
    const { passed, failed, pending } = totals;
    const caseTotal = passed + failed + pending;
    const result = {
      测试用例总量: totalTable,
      e2e用例总量: caseTotal,
      e2e用例通过: passed,
      e2e用例失败: failed,
      e2e用例跳过: pending,
      e2e用例通过覆盖率: `${((passed / totalTable) * 100).toFixed(2)}%`,
      e2e用例失败覆盖率: `${((failed / totalTable) * 100).toFixed(2)}%`,
      e2e用例跳过覆盖率: `${((pending / totalTable) * 100).toFixed(2)}%`,
      e2e用例总覆盖率: `${((caseTotal / totalTable) * 100).toFixed(2)}%`,
    };

    const totalList = [];
    Object.keys(result).forEach((key) => {
      totalList.push({
        name: key,
        value: result[key],
      });
    });
    this.totalList = totalList;
  };

  UpdateContextWithDetail(moduleList) {
    const detailList = [];
    moduleList.forEach((module) => {
      const { first, second, third } = module;
      const name = third
        ? `${this.GetSimpleName(first)}-${this.GetSimpleName(
            second
          )}-${this.GetSimpleName(third)}`
        : `${this.GetSimpleName(first)}-${this.GetSimpleName(second)}`;
      const { passed, e2eTotal, totalPercent, failed, pending, caseCount } =
        module;
      detailList.push({
        name,
        caseCount,
        passed: passed || '-',
        e2eTotal: e2eTotal || '-',
        totalPercent: totalPercent === '0.00%' ? '-' : totalPercent,
        failed: failed || '-',
        pending: pending || '-',
      });
    });
    this.detailList = detailList;
  }

  async GenerateResult() {
    // read html template
    const moduleList = this.GetHtmlAllModules(this.htmlString, this.caseNames);
    const newHtmlString = this.UpdateHtmlWithTotal(this.htmlString, contentTag);
    const template = Handlebars.compile(newHtmlString);

    this.UpdateContextWithTotal();
    this.UpdateContextWithDetail(moduleList);
    Handlebars.registerHelper(
      'CheckAuto',
      (caseName) => caseName || funcMap.unknown()
    );
    // remove useless videos
    // dealWithVideos();
    // write new html
    const data = {
      ...this.reportData,
      totalList: this.totalList,
      detailList: this.detailList,
    };
    fs.writeFileSync(this.outputFile, template(data));

    // eslint-disable-next-line no-console
    console.log(
      'Generate template with e2e result successfully, saved to:',
      this.outputFile
    );
  }

  async GetJsonDataFromUrl(reportJsonUrl) {
    try {
      const res = await axios.get(reportJsonUrl);
      return res.data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    return {
      stats: {},
      results: [],
    };
  }

  async GetCaseMapByReportJsonUrlList(reportJsonUrlList) {
    const reportDataAll = await Promise.all(
      reportJsonUrlList.map((url) => this.GetJsonDataFromUrl(url))
    );

    reportDataAll.forEach((data) => {
      data.results.forEach((result) => {
        result.suites.forEach((suite) => {
          suite.tests.forEach((test) => {
            if (!test.context) {
              return;
            }
            const context = JSON.parse(test.context);
            if (!context) {
              return;
            }
            this.GetCaseMap(test);
          });
        });
      });
    });
    return {
      caseNameAll: this.caseNames,
      reportDataAll,
    };
  }

  async GenerateSummary() {
    // await this.GetCaseMapByReportJsonUrlList(this.reportJsonUrlList);

    const moduleList = this.GetHtmlAllModules(this.htmlString, this.caseNames);

    const templateFilePath = root('tools/summary-template.html');
    const templateFile = fs.readFileSync(templateFilePath);
    const templateString = templateFile.toString();

    const tag = '<div id="summary">';
    const newHtmlString = this.UpdateHtmlWithTotal(templateString, tag, true);
    const template = Handlebars.compile(newHtmlString);
    this.UpdateContextWithTotal();
    this.UpdateContextWithDetail(moduleList);

    const data = {
      date: moment().format('YYYY-MM-DD'),
      totalList: this.totalList,
      detailList: this.detailList,
    };
    fs.writeFileSync(this.summaryOutputFile, template(data));
    // eslint-disable-next-line no-console
    console.log(
      'Generate e2e coverage summary successfully, saved to:',
      this.summaryOutputFile
    );
  }

  GetTestContextCaseValue(test) {
    const context = JSON.parse(test.context);
    if (Array.isArray(context)) {
      const item = context.find((it) => isObject(it) && it.value);
      return item.value || {};
    }
    return (
      ((context || {}).value && (context || {}).value.unverifiedTestConfig) ||
      {}
    );
  }

  GetCaseMap(test) {
    const cases = [];
    const { state, title: caseName } = test;
    const updateNames = (name) => {
      if (!this.caseNames[name]) {
        this.caseNames[name] = state;
      }
    };

    updateNames(caseName);

    if (cases.length) {
      cases.forEach((cname) => {
        updateNames(cname);
      });
    }
  }

  ParseReportJson() {
    const reportDataAll = JSON.parse(fs.readFileSync(this.reportJson));
    const { passes, failures, pending, skipped } = reportDataAll.stats;

    this.reportDataAll = reportDataAll;
    this.totalByCase = assign(this.totalByCase, {
      passed: passes,
      failed: failures,
      pending,
      skipped,
    });

    reportDataAll.results.forEach((result) => {
      const file = result.file.split('e2e/pages/')[1];
      result.suites.forEach((suite) => {
        const fileTitle = suite.title;
        suite.tests.forEach((test) => {
          const cases = [];
          const { title: caseName, state } = test;
          if (!caseName) {
            return;
          }
          const imageUrl =
            state === 'failed'
              ? `${this.screenshotDir}/${file}/${fileTitle} -- ${test.title} (failed).png`
              : '';
          const videoName = `${file}.mp4`;
          const videoUrl =
            state === 'failed' ? `${this.videoDir}${videoName}` : '';
          if (videoUrl && !errorVideos[videoName]) {
            errorVideos[videoName] = videoUrl;
          }
          this.reportData[caseName] = funcMap[state](
            test,
            caseName,
            this.reportLink,
            imageUrl,
            videoUrl
          );

          this.GetCaseMap(test);

          if (cases.length) {
            cases.forEach((cname) => {
              this.reportData[cname] = funcMap[state](
                test,
                cname,
                this.reportLink,
                imageUrl,
                videoUrl
              );
            });
          }
        });
      });
    });
  }
}

module.exports = GeneratorReport;

// eslint-disable-next-line no-new
new GeneratorReport();
