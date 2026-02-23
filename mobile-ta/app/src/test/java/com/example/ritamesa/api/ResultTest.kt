package com.example.ritamesa.api

import com.google.common.truth.Truth.assertThat
import org.junit.Test

/**
 * Unit tests for the Result sealed class
 * Tests the Success, Error, and Loading states and their utility functions
 */
class ResultTest {

    @Test
    fun testSuccessCreation() {
        val data = "Test Data"
        val result = Result.Success(data)
        
        assertThat(result).isInstanceOf(Result.Success::class.java)
        assertThat((result as Result.Success).data).isEqualTo(data)
    }

    @Test
    fun testErrorCreation() {
        val exception = Exception("Test error")
        val message = "Custom message"
        val result = Result.Error(exception, message)
        
        assertThat(result).isInstanceOf(Result.Error::class.java)
        assertThat((result as Result.Error).exception).isEqualTo(exception)
        assertThat(result.message).isEqualTo(message)
    }

    @Test
    fun testLoadingCreation() {
        val result = Result.Loading<String>()
        
        assertThat(result).isInstanceOf(Result.Loading::class.java)
    }

    @Test
    fun testGetOrNullOnSuccess() {
        val data = "Success Data"
        val result = Result.Success(data)
        
        assertThat(result.getOrNull()).isEqualTo(data)
    }

    @Test
    fun testGetOrNullOnError() {
        val result = Result.Error(Exception("Error"))
        
        assertThat(result.getOrNull() as Any?).isNull()
    }

    @Test
    fun testGetOrNullOnLoading() {
        val result = Result.Loading<String>()
        
        assertThat(result.getOrNull() as Any?).isNull()
    }

    @Test
    fun testExceptionOrNullOnSuccess() {
        val result = Result.Success("Data")
        
        assertThat(result.exceptionOrNull()).isNull()
    }

    @Test
    fun testExceptionOrNullOnError() {
        val exception = Exception("Test error")
        val result = Result.Error(exception)
        
        assertThat(result.exceptionOrNull()).isEqualTo(exception)
    }

    @Test
    fun testExceptionOrNullOnLoading() {
        val result = Result.Loading<String>()
        
        assertThat(result.exceptionOrNull()).isNull()
    }

    @Test
    fun testIsSuccess() {
        assertThat(Result.Success("Data").isSuccess()).isTrue()
        assertThat(Result.Error(Exception()).isSuccess()).isFalse()
        assertThat(Result.Loading<String>().isSuccess()).isFalse()
    }

    @Test
    fun testIsError() {
        assertThat(Result.Success("Data").isError()).isFalse()
        assertThat(Result.Error(Exception()).isError()).isTrue()
        assertThat(Result.Loading<String>().isError()).isFalse()
    }

    @Test
    fun testIsLoading() {
        assertThat(Result.Success("Data").isLoading()).isFalse()
        assertThat(Result.Error(Exception()).isLoading()).isFalse()
        assertThat(Result.Loading<String>().isLoading()).isTrue()
    }

    @Test
    fun testMapOnSuccess() {
        val result = Result.Success(5)
        val mapped = result.map { it * 2 }
        
        assertThat(mapped).isInstanceOf(Result.Success::class.java)
        assertThat((mapped as Result.Success).data).isEqualTo(10)
    }

    @Test
    fun testMapOnError() {
        val exception = Exception("Error")
        val result: Result<Int> = Result.Error(exception)
        val mapped = result.map { it * 2 }
        
        assertThat(mapped).isInstanceOf(Result.Error::class.java)
        assertThat((mapped as Result.Error).exception).isEqualTo(exception)
    }

    @Test
    fun testMapOnLoading() {
        val result = Result.Loading<Int>()
        val mapped = result.map { it * 2 }
        
        assertThat(mapped).isInstanceOf(Result.Loading::class.java)
    }

    @Test
    fun testOnSuccessCallback() {
        var called = false
        val result = Result.Success("Data")
        
        result.onSuccess {
            called = true
            assertThat(it).isEqualTo("Data")
        }
        
        assertThat(called).isTrue()
    }

    @Test
    fun testOnSuccessCallbackNotCalledOnError() {
        var called = false
        val result: Result<String> = Result.Error(Exception())
        
        result.onSuccess {
            called = true
        }
        
        assertThat(called).isFalse()
    }

    @Test
    fun testOnErrorCallback() {
        var called = false
        val exception = Exception("Error")
        val message = "Custom message"
        val result = Result.Error(exception, message)
        
        result.onError { exc, msg ->
            called = true
            assertThat(exc).isEqualTo(exception)
            assertThat(msg).isEqualTo(message)
        }
        
        assertThat(called).isTrue()
    }

    @Test
    fun testOnErrorCallbackNotCalledOnSuccess() {
        var called = false
        val result = Result.Success("Data")
        
        result.onError { _, _ ->
            called = true
        }
        
        assertThat(called).isFalse()
    }

    @Test
    fun testOnLoadingCallback() {
        var called = false
        val result = Result.Loading<String>()
        
        result.onLoading {
            called = true
        }
        
        assertThat(called).isTrue()
    }

    @Test
    fun testOnLoadingCallbackNotCalledOnSuccess() {
        var called = false
        val result = Result.Success("Data")
        
        result.onLoading {
            called = true
        }
        
        assertThat(called).isFalse()
    }

    @Test
    fun testResultChaining() {
        val result = Result.Success(10)
            .map { it * 2 }
            .map { it + 5 }
        
        assertThat((result as Result.Success).data).isEqualTo(25)
    }

    @Test
    fun testResultChainingWithError() {
        val exception = Exception("Error")
        val result: Result<Int> = Result.Error(exception)
            .map { value: Int -> value * 2 }
            .map { value: Int -> value + 5 }
        
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }
}
