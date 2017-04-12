const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  index = require('..'),
  sinon = require('sinon'),
  {readFileSync, writeFileSync} = require('fs');

describe('module tasks', () => {

  describe('readJson', () => {

    it('should read json file', () => {
      return empty().within(() => {
        const stubModule = {name: 'a', path: process.cwd(), fullPath: process.cwd()};
        const writtenJson = {key: 'val'};
        writeFileSync('f.json', JSON.stringify(writtenJson));

        return index.module.readJson(stubModule)('f.json')()().then(readJson => {
          expect(readJson).to.deep.equal(writtenJson);
        });
      });
    });
  });

  describe('writeJson', () => {

    it('should write json file if target does not exist', () => {
      return empty().within(() => {
        const stubModule = {name: 'a', path: process.cwd(), fullPath: process.cwd()};
        const json = {key: 'val'};

        return index.module.writeJson(stubModule)('f.json')(json)().then(() => {
          expect(JSON.parse(readFileSync('f.json').toString())).to.deep.equal(json);
        });
      });
    });

    it('should overwrite existing json file', () => {
      return empty().within(() => {
        const stubModule = {name: 'a', path: process.cwd(), fullPath: process.cwd()};
        writeFileSync('f.json', `{"key1":    "val"}`);

        return index.module.writeJson(stubModule)('f.json')({key: 'val'})().then(json => {
          expect(json).to.deep.equal({key: 'val'});
        });
      });
    });

    it('should not overwrite existing json file if it has same content', () => {
      return empty().within(() => {
        const stubModule = {name: 'a', path: process.cwd(), fullPath: process.cwd()};
        const existingJsonFile = `{"key":    "val"}`;
        writeFileSync('f.json', existingJsonFile);

        return index.module.writeJson(stubModule)('f.json')({key: 'val'})().then(json => {
          expect(readFileSync('./f.json').toString()).to.equal(existingJsonFile);
        });
      });
    });
  });

  describe('mergeJson', () => {

    it('should deep merge json and callback with merged nodes', () => {
      const cb = sinon.spy();
      const input = {
        a: {
          b: 1,
          c: 2
        }
      };

      const overrides = {
        a: {
          c: 3
        }
      };

      return index.module.mergeJson(cb)(overrides)(input)().then(res => {
        expect(res).to.deep.equal({
          a: {
            b: 1,
            c: 3
          }
        });
        expect(cb).to.have.been.calledWith(sinon.match({key: 'a.c', currentValue: 2, newValue: 3}));
        expect(cb).to.have.been.calledOnce;
      });

    });

  });
});