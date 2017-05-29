export class TwbColumnRenamer {

  public metadataRecords: Element[];

  public dataSourceColumns: Element[];

  public currentDataSource: Element;

  public currentXml: XMLDocument;

  public replaceColumnNames(source: string) {
    if (this.metadataRecords) {
      const replaceNames: string[] = source.split('\n');
      this.metadataRecords.forEach((metadataRecord: Element, index: number) => {
        if (!replaceNames[index]) {
          return;
        }
        const localName: string = metadataRecord.getElementsByTagName('local-name').item(0).textContent;
        const replaceName: string = replaceNames[index];
        let matchColumn: Element;
        // NOTE : localName とマッチする column の有無をチェックして入力項目に置換 ( caption 属性を付与 )
        // カラムが見つからなかった場合は column を生成して追加する
        const isMatch: boolean = this.dataSourceColumns.some((column: Element) => {
          let tmpMatch: boolean = (column.getAttribute('name') === localName);
          matchColumn = tmpMatch ? column : undefined;
          return tmpMatch;
        });
        if (isMatch) {
          matchColumn.setAttribute('caption', replaceName);
        } else {
          const dataType = metadataRecord.getElementsByTagName('local-type').item(0).textContent;
          const refChild = this.currentDataSource.getElementsByTagName('column-instance').item(0);
          // NOTE: document.createElement だと xmlns 属性が付与され Tableau Desktop でパースエラーが出るため
          const newColumnElement = document.createElementNS(null, 'column');
          newColumnElement.setAttribute('caption', replaceName);
          newColumnElement.setAttribute('datatype', dataType);
          newColumnElement.setAttribute('name', localName);
          newColumnElement.setAttribute('role', 'dimension');
          // NOTE: datatype が string のときは 'nominal' それ以外は 'ordinal' で ( 仕様的に本当に正しいかは謎 )
          newColumnElement.setAttribute('type', dataType === 'string' ? 'nominal' : 'ordinal');
          // NOTE: <column-instance> より手前に貼り付けないと Tableau Desktop でパースエラーが出るため
          this.currentDataSource.insertBefore(newColumnElement, refChild);
        }
      });
    }
  }

  public getLocalNamesString(): string {
    let result = '';
    this.metadataRecords.forEach(
      metadataRecord => result += ( metadataRecord.getElementsByTagName('local-name').item(0).textContent + '\n')
    );
    return result;
  }

  public exportTwb(currentFileName: string) {
    const blob = new Blob([this.currentXml.documentElement.outerHTML], {type: 'text/xml'});
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
      } else {
        result.push(metadataRecord);
      }
    });
    return result;
  }

  private getDataSourceColumns(datasource: Element): Element[] {
    const result       : Element[] = [];
    const metadataList : Element[] = this.getChildNodesByTagName(datasource, 'column');
    metadataList.forEach((column: Element) => {
      if (column.hasChildNodes()) {
        return;
      } else {
        result.push(column);
      }
    });
    return result;
  }

  private loadTwb(source: string) {
    const xml          : XMLDocument = new DOMParser().parseFromString(source, 'text/xml');
    const workbook     : Element     = xml.getElementsByTagName('workbook').item(0);
    const dataSources  : Element     = workbook.getElementsByTagName('datasources').item(0);
    const metadataList : Element[]   = this.getChildNodesByTagName(dataSources, 'datasource');
    metadataList.forEach((datasource: Element) => {
      const hasConnection = datasource.getAttribute('hasconnection');
      if (hasConnection && hasConnection === 'false') {
        return;
      } else {
        this.metadataRecords = this.getMetadataRecords(datasource);
        this.dataSourceColumns = this.getDataSourceColumns(datasource);
        this.currentXml = xml;
        this.currentDataSource = datasource;
      }
    });
  }

}
