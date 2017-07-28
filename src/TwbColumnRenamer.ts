export class TwbColumnRenamer {

  public metadataRecordsList: Element[][];

  public dataSourceColumnsList: Element[][];

  public currentDataSources: Element[];

  public currentXml: XMLDocument;

  private getRefChild(element: Element): Node {
    const candidateTags = ['column', 'aliases', 'connection'];
    let resultElement: Node;
    candidateTags.forEach((tagName: string) => {
      if (resultElement) {
        return;
      }
      const tmpElements = this.getChildNodesByTagName(element, tagName);
      if (tmpElements.length > 0) {
        resultElement =  ( tmpElements[tmpElements.length - 1] ).nextElementSibling;
      }
    });
    return resultElement;
  }

  public replaceColumnNames(source: string) {
    if (this.metadataRecordsList) {
      const replaceNames: string[] = source.split('\n');
      let replaceNamesCounter: number = 0;
      this.metadataRecordsList.forEach((metadataRecords: Element[], index: number) => {
        metadataRecords.forEach((metadataRecord: Element) => {
          if (!replaceNames[replaceNamesCounter]) {
            replaceNamesCounter++;
            return;
          }
          const localName: string = metadataRecord.getElementsByTagName('local-name').item(0).textContent;
          const replaceName: string = replaceNames[replaceNamesCounter];
          let matchColumn: Element;
          // NOTE : localName とマッチする column の有無をチェックして入力項目に置換 ( caption 属性を付与 )
          // カラムが見つからなかった場合は column を生成して追加する
          const isMatch = this.dataSourceColumnsList[index].some((column: Element) => {
            let tmpMatch: boolean = (column.getAttribute('name') === localName);
            matchColumn = tmpMatch ? column : undefined;
            return tmpMatch;
          });
          if (isMatch) {
            matchColumn.setAttribute('caption', replaceName);
          } else {
            const dataType = metadataRecord.getElementsByTagName('local-type').item(0).textContent;
            const targetDataSources = this.currentDataSources[index];
            const refChild = this.getRefChild(targetDataSources);
            // NOTE: document.createElement だと xmlns 属性が付与され Tableau Desktop でパースエラーが出るため
            const newColumnElement = document.createElementNS(null, 'column');
            newColumnElement.setAttribute('caption', replaceName);
            newColumnElement.setAttribute('datatype', dataType);
            newColumnElement.setAttribute('name', localName);
            newColumnElement.setAttribute('role', 'dimension');
            // NOTE: datatype が string のときは 'nominal' それ以外は 'ordinal' で ( 仕様的に本当に正しいかは謎 )
            newColumnElement.setAttribute('type', dataType === 'string' ? 'nominal' : 'ordinal');
            if (refChild) {
              targetDataSources.insertBefore(newColumnElement, refChild);
            } else {
              targetDataSources.appendChild(newColumnElement);
            }
          }
          replaceNamesCounter++;
        });
      });
    }
  }

  public getLocalNamesString(): string {
    let result = '';
    this.metadataRecordsList.forEach(
      metadataRecords => metadataRecords.forEach(
        metadataRecord => result += ( metadataRecord.getElementsByTagName('local-name').item(0).textContent + '\n' )
      )
    );
    return result;
  }

  public exportTwb(currentFileName: string) {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, this.currentXml.documentElement.outerHTML], {type: 'text/xml;charset=utf-8'});
    const fileName = `${currentFileName}_replace.twb`;
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.target = '_blank';
      a.download = fileName;
      a.click();
    }
  }

  constructor(source: any) {
    this.loadTwb(source);
  }

  private getChildNodesByTagName(element: Element, tagName: string): Element[] {
    const children: NodeList = element.childNodes;
    const result: Element[] = [];
    let i = 0;
    while (++i < children.length) {
      const child: Node = children.item(i);
      if(child.nodeType === Node.ELEMENT_NODE) {
        if(child.nodeName.toLowerCase() === tagName) {
          result.push(child as Element);
        }
      }
    }
    return result;
  }

  private getMetadataRecords(datasource: Element): Element[] {
    const result          : Element[] = [];
    const connection      : Element   = datasource.getElementsByTagName('connection').item(0);
    const metadataRecords : Element   = connection.getElementsByTagName('metadata-records').item(0);
    const metadataList    : Element[] = this.getChildNodesByTagName(metadataRecords, 'metadata-record');
    metadataList.forEach((metadataRecord: Element) => {
      if (metadataRecord.getAttribute('class') !== 'column') {
        return;
      } else if (metadataRecord.getElementsByTagName('local-name').length > 0) {
        result.push(metadataRecord);
      }
    });
    return result;
  }

  private getDataSourceColumns(datasource: Element): Element[] {
    const result     : Element[] = [];
    const columnList : Element[] = this.getChildNodesByTagName(datasource, 'column');
    columnList.forEach((column: Element) => {
      if (column.hasChildNodes()) {
        return;
      } else {
        result.push(column);
      }
    });
    return result;
  }

  private loadTwb(source: string) {
    this.metadataRecordsList   = [];
    this.dataSourceColumnsList = [];
    this.currentDataSources    = [];
    const xml          : XMLDocument = new DOMParser().parseFromString(source, 'text/xml');
    const workbook     : Element     = xml.getElementsByTagName('workbook').item(0);
    const dataSources  : Element     = workbook.getElementsByTagName('datasources').item(0);
    const metadataList : Element[]   = this.getChildNodesByTagName(dataSources, 'datasource');
    metadataList.forEach((datasource: Element) => {
      const hasConnection = datasource.getAttribute('hasconnection');
      if (hasConnection && hasConnection === 'false') {
        return;
      } else {
        this.metadataRecordsList.push(this.getMetadataRecords(datasource));
        this.dataSourceColumnsList.push(this.getDataSourceColumns(datasource));
        this.currentDataSources.push(datasource);
      }
    });
    this.currentXml = xml;
  }

}
