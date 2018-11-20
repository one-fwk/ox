import { TestingModule } from '@one/testing';
import { OxModule } from '@ox/core';
import { DeclarationMetadata } from '@ox/collection';

export class Test {
  private static createModule(metadata: DeclarationMetadata) {
    @OxModule(metadata)
    class TestingModule {}

    return TestingModule;
  }

  public static createOxTestingModule(metadata: DeclarationMetadata) {
    const module = this.createModule(metadata);
    return new TestingModule(module);
  }
}