package _package.is.optional;

import java.io.*;
import java.util.List;
import java.util.ArrayList;

@MarkerAnnotation
@SingleValueAnnotation("unused")
@FullAnnotation(
	value1 = 1,
	value2 = "String")
public final class FullFunctionDemo extends SuperClass implements Interface1, Interface2 {
	String string;
	private int privateInt;
	private int privateIntWithValue = 1;
	public final static List<String> publicFinalStaticList;

	FullFunctionDemo () {
		// constructor with no access modifier
	}
	public FullFunctionDemo (String arg1, int arg2) {
		// constructor with accessModifier & arguments
	}

	void emptyMethod () {
	}
	@Deprecated
	public final static boolean fullFunctionMethod (String arg1, String arg2) {
		if (arg1.equals(arg2)) {
			return true;
		} else {
			return false;
		}
	}

	class InnerClass1 implements Interface1 {
	}
	class InnerClass2 implements Interface1, Interface2 {
	}
}
