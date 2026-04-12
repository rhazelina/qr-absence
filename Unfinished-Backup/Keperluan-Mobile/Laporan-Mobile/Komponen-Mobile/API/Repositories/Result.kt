package com.example.ritamesa.api

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception, val message: String? = null) : Result<Nothing>()
    class Loading<T> : Result<T>()

    fun getOrNull(): T? = when (this) {
        is Success -> data
        else -> null
    }

    fun exceptionOrNull(): Exception? = when (this) {
        is Error -> exception
        else -> null
    }

    fun isSuccess(): Boolean = this is Success
    fun isError(): Boolean = this is Error
    fun isLoading(): Boolean = this is Loading
    
    fun <R> map(transform: (T) -> R): Result<R> {
        return when (this) {
            is Success -> Success(transform(data))
            is Error -> Error(exception, message)
            is Loading -> Loading()
        }
    }
    
    fun onSuccess(block: (T) -> Unit): Result<T> {
        if (this is Success) block(data)
        return this
    }
    
    fun onError(block: (Exception, String?) -> Unit): Result<T> {
        if (this is Error) block(exception, message)
        return this
    }
    
    fun onLoading(block: () -> Unit): Result<T> {
        if (this is Loading) block()
        return this
    }
}

// ===== EXTENSION FUNCTIONS FOR EASIER USE =====
inline fun <T> Result<T>.fold(
    onSuccess: (T) -> Unit,
    onError: (Exception, String?) -> Unit,
    onLoading: () -> Unit = {}
) {
    when (this) {
        is Result.Success -> onSuccess(data)
        is Result.Error -> onError(exception, message)
        is Result.Loading -> onLoading()
    }
}
